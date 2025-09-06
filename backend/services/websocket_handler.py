from fastapi import WebSocket, WebSocketDisconnect
import json
import asyncio
from typing import Dict, Any
from services.ado_generator import ADOGenerator, ADOValidator
from schemas.application_definition import (
    GenerationRequest, 
    ModificationRequest, 
    ApplicationDefinitionObject,
    StyleFramework
)

class EnhancedWebSocketHandler:
    """Enhanced WebSocket handler with ADO support"""
    
    def __init__(self, api_key: str):
        self.ado_generator = ADOGenerator(api_key)
        self.validator = ADOValidator()
    
    async def handle_generate_stream(self, websocket: WebSocket):
        """Handle streaming generation with ADO"""
        await websocket.accept()
        
        try:
            # Receive initial request
            data = await websocket.receive_json()
            prompt = data.get("prompt")
            framework = data.get("framework", "react")
            style_framework = data.get("style_framework", "tailwindcss")
            
            print(f"🚀 Starting generation for prompt: {prompt[:100]}...")
            
            if not prompt:
                await websocket.send_json({
                    "event": "error", 
                    "message": "Prompt is required."
                })
                return
            
            # Create generation request
            request = GenerationRequest(
                prompt=prompt,
                framework=framework,
                style_framework=StyleFramework(style_framework)
            )
            
            # Step 1: Generate ADO
            await websocket.send_json({
                "event": "status",
                "message": "🧠 Analyzing requirements and creating application structure..."
            })
            
            print("📋 Generating ADO...")
            try:
                ado = await self.ado_generator.generate_ado_from_prompt(request)
                print(f"✅ ADO generated successfully: {ado.name}")
            except Exception as e:
                print(f"❌ ADO generation failed: {str(e)}")
                await websocket.send_json({
                    "event": "error",
                    "message": f"Failed to generate application structure: {str(e)}"
                })
                return
            
            # Validate and enrich ADO
            issues = self.validator.validate_ado(ado)
            if issues:
                print(f"⚠️  ADO validation issues: {issues}")
                await websocket.send_json({
                    "event": "warning",
                    "message": f"ADO validation issues: {', '.join(issues)}"
                })
            
            ado = self.validator.enrich_ado(ado)
            
            # Send ADO to frontend
            await websocket.send_json({
                "event": "ado_generated",
                "ado": ado.model_dump(),
                "message": f"📋 Created application definition with {len(ado.files)} files"
            })
            
            # Step 2: Generate file structure
            file_paths = [f.path for f in ado.files]
            await websocket.send_json({
                "event": "structure_generated",
                "files": file_paths
            })
            
            # Step 3: Generate file contents
            await websocket.send_json({
                "event": "status",
                "message": "⚡ Generating code files..."
            })
            
            total_files = len(ado.files)
            for i, file_def in enumerate(ado.files):
                print(f"📝 Generating file {i+1}/{total_files}: {file_def.path}")
                
                await websocket.send_json({
                    "event": "file_start",
                    "path": file_def.path,
                    "description": file_def.description
                })
                
                try:
                    # Generate content if not already present
                    if file_def.content:
                        content = file_def.content
                        print(f"📄 Using existing content for {file_def.path}")
                    else:
                        print(f"🤖 Generating new content for {file_def.path}")
                        content = await self.ado_generator._generate_file_content(file_def, ado)
                    
                    # Stream content in chunks
                    chunk_size = 100
                    for j in range(0, len(content), chunk_size):
                        chunk = content[j:j + chunk_size]
                        await websocket.send_json({
                            "event": "code_chunk",
                            "path": file_def.path,
                            "chunk": chunk
                        })
                        await asyncio.sleep(0.05)  # Small delay for streaming effect
                    
                    await websocket.send_json({
                        "event": "file_end",
                        "path": file_def.path,
                        "progress": ((i + 1) / total_files) * 100
                    })
                    
                except Exception as e:
                    print(f"❌ Failed to generate {file_def.path}: {str(e)}")
                    # Continue with other files
                    await websocket.send_json({
                        "event": "file_end",
                        "path": file_def.path,
                        "progress": ((i + 1) / total_files) * 100,
                        "error": f"Failed to generate content: {str(e)}"
                    })
            
            # Step 4: Complete generation
            print("✅ Generation completed successfully!")
            await websocket.send_json({
                "event": "finish",
                "message": "✅ Application generated successfully!",
                "ado": ado.model_dump()
            })
            
        except WebSocketDisconnect:
            print("🔌 Client disconnected during generation")
        except Exception as e:
            error_msg = f"Generation error: {str(e)}"
            print(f"❌ {error_msg}")
            try:
                await websocket.send_json({
                    "event": "error",
                    "message": error_msg
                })
            except:
                pass
        finally:
            await websocket.close()
    
    async def handle_chat(self, websocket: WebSocket):
        """Handle conversational modifications with ADO"""
        await websocket.accept()
        
        try:
            while True:
                data = await websocket.receive_json()
                
                if data.get("type") == "chat_message":
                    user_message = data.get("message")
                    current_ado_data = data.get("current_ado")
                    current_files = data.get("current_files", {})
                    
                    if not user_message:
                        await websocket.send_json({
                            "type": "error",
                            "message": "Message is required"
                        })
                        continue
                    
                    # Create modification request
                    if current_ado_data:
                        current_ado = ApplicationDefinitionObject(**current_ado_data)
                    else:
                        # Create ADO from current files if not available
                        current_ado = await self._create_ado_from_files(current_files)
                    
                    modification_request = ModificationRequest(
                        modification_prompt=user_message,
                        current_ado=current_ado
                    )
                    
                    await websocket.send_json({
                        "type": "status",
                        "message": "🤖 Understanding your request..."
                    })
                    
                    # Generate modifications
                    try:
                        modified_ado = await self.ado_generator.modify_ado(modification_request)
                        
                        # Generate updated files
                        updated_files = await self.ado_generator.generate_files_from_ado(modified_ado)
                        
                        # Send response
                        await websocket.send_json({
                            "type": "chat_response",
                            "response": f"I've updated your application based on your request: '{user_message}'",
                            "changes": updated_files,
                            "updated_ado": modified_ado.model_dump()
                        })
                        
                    except Exception as e:
                        await websocket.send_json({
                            "type": "error",
                            "message": f"Failed to process modification: {str(e)}"
                        })
                
                elif data.get("type") == "validate_ado":
                    ado_data = data.get("ado")
                    if ado_data:
                        try:
                            ado = ApplicationDefinitionObject(**ado_data)
                            issues = self.validator.validate_ado(ado)
                            
                            await websocket.send_json({
                                "type": "validation_result",
                                "valid": len(issues) == 0,
                                "issues": issues
                            })
                        except Exception as e:
                            await websocket.send_json({
                                "type": "validation_result",
                                "valid": False,
                                "issues": [f"Invalid ADO structure: {str(e)}"]
                            })
                
        except WebSocketDisconnect:
            print("Chat client disconnected")
        except Exception as e:
            print(f"Chat error: {str(e)}")
    
    async def _create_ado_from_files(self, files: Dict[str, str]) -> ApplicationDefinitionObject:
        """Create a basic ADO from existing files"""
        
        file_definitions = []
        dependencies = []
        components = []
        
        for path, content in files.items():
            # Determine file type
            file_type = "js"
            if path.endswith('.jsx'):
                file_type = "jsx"
            elif path.endswith('.tsx'):
                file_type = "tsx"
            elif path.endswith('.ts'):
                file_type = "ts"
            elif path.endswith('.css'):
                file_type = "css"
            elif path.endswith('.json'):
                file_type = "json"
            elif path.endswith('.html'):
                file_type = "html"
            
            file_definitions.append({
                "path": path,
                "type": file_type,
                "content": content,
                "description": f"Generated from existing file"
            })
            
            # Extract component info from JSX/TSX files
            if file_type in ["jsx", "tsx"] and "export default" in content:
                # Simple component extraction
                component_name = path.split('/')[-1].replace('.jsx', '').replace('.tsx', '')
                components.append({
                    "name": component_name,
                    "type": "functional",
                    "file_path": path,
                    "props": [],
                    "imports": [],
                    "exports": ["default"],
                    "description": f"Component from {path}"
                })
        
        # Extract dependencies from package.json if present
        package_json_content = files.get("package.json") or files.get("frontend/package.json")
        if package_json_content:
            try:
                package_data = json.loads(package_json_content)
                deps = package_data.get("dependencies", {})
                dev_deps = package_data.get("devDependencies", {})
                
                for name, version in deps.items():
                    dependencies.append({
                        "name": name,
                        "version": version,
                        "dev": False
                    })
                
                for name, version in dev_deps.items():
                    dependencies.append({
                        "name": name,
                        "version": version,
                        "dev": True
                    })
            except:
                pass
        
        return ApplicationDefinitionObject(
            name="existing-app",
            description="Application created from existing files",
            framework="react",
            files=file_definitions,
            components=components,
            dependencies=dependencies
        )
