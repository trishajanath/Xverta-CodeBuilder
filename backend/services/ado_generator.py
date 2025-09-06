import google.generativeai as genai
import json
import asyncio
from typing import Dict, List, Optional
from schemas.application_definition import (
    ApplicationDefinitionObject, 
    GenerationRequest, 
    ModificationRequest,
    GenerationResponse,
    FileDefinition,
    ComponentDefinition,
    Dependency,
    FileType,
    ComponentType
)

class ADOGenerator:
    """
    Advanced Application Definition Object Generator
    Uses structured prompts to generate consistent, high-quality applications
    """
    
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config={
                "temperature": 0.7,
                "top_p": 0.9,
                "max_output_tokens": 4096,
            }
        )
    
    async def generate_ado_from_prompt(self, request: GenerationRequest) -> ApplicationDefinitionObject:
        """Generate a complete ADO from a natural language prompt"""
        
        ado_prompt = f"""
        Create a complete Application Definition Object (ADO) for the following request.
        
        Prompt: "{request.prompt}"
        Framework: {request.framework}
        Style Framework: {request.style_framework.value}
        Additional Requirements: {request.additional_requirements}
        
        You must return ONLY a valid JSON object with this exact structure (no markdown, no explanations):
        
        {{
            "name": "my-app",
            "description": "Brief description",
            "framework": "{request.framework}",
            "files": [
                {{
                    "path": "package.json",
                    "type": "json",
                    "content": "",
                    "description": "Package configuration"
                }},
                {{
                    "path": "src/App.jsx",
                    "type": "jsx", 
                    "content": "",
                    "description": "Main app component",
                    "component": "App"
                }}
            ],
            "components": [
                {{
                    "name": "App",
                    "type": "functional",
                    "file_path": "src/App.jsx",
                    "props": [
                        {{
                            "name": "title",
                            "type": "string",
                            "required": false,
                            "default_value": "My App",
                            "description": "Application title"
                        }}
                    ],
                    "imports": ["react"],
                    "exports": ["default"],
                    "description": "Main application component"
                }}
            ],
            "dependencies": [
                {{
                    "name": "react",
                    "version": "^18.2.0",
                    "dev": false
                }},
                {{
                    "name": "tailwindcss",
                    "version": "^3.3.0",
                    "dev": true
                }}
            ],
            "style_config": {{
                "framework": "{request.style_framework.value}",
                "theme": {{}},
                "custom_css": null
            }}
        }}
        
        CRITICAL RULES:
        1. Return ONLY the JSON object - no markdown blocks, no explanations
        2. Use double quotes for all strings
        3. Component props MUST be objects with name, type, required, default_value, description fields
        4. Style framework MUST be one of: "tailwindcss", "styled-components", "emotion", "css-modules", "css"
        5. File types MUST be: "js", "jsx", "tsx", "ts", "css", "scss", "json", "html", "md"
        6. Component types MUST be: "functional", "class", "page", "layout", "hook", "utility"
        7. Keep file content empty (will be generated separately)
        8. Ensure all JSON is valid and properly formatted
        
        JSON Response:"""
        
        # Try multiple times with different approaches if JSON parsing fails
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await self._generate_with_retry(ado_prompt)
                
                # Extract and validate JSON
                json_str = self._extract_json(response.text)
                ado_data = json.loads(json_str)
                
                # Fix common validation issues
                ado_data = self._fix_ado_validation_issues(ado_data)
                
                # Validate and create ADO
                ado = ApplicationDefinitionObject(**ado_data)
                return ado
                
            except json.JSONDecodeError as e:
                print(f"JSON parsing failed on attempt {attempt + 1}: {str(e)}")
                if attempt < max_retries - 1:
                    # Try with a simpler prompt
                    ado_prompt = f"""
                    Generate a simple JSON for a {request.framework} app: "{request.prompt}"
                    
                    Return only this JSON structure:
                    {{
                        "name": "simple-app",
                        "description": "Simple app description",
                        "framework": "{request.framework}",
                        "files": [
                            {{"path": "package.json", "type": "json", "content": "", "description": "Package file"}},
                            {{"path": "src/App.jsx", "type": "jsx", "content": "", "description": "Main component"}}
                        ],
                        "components": [
                            {{"name": "App", "type": "functional", "file_path": "src/App.jsx", "props": [], "imports": ["react"], "exports": ["default"], "description": "Main component"}}
                        ],
                        "dependencies": [
                            {{"name": "react", "version": "^18.2.0", "dev": false}}
                        ],
                        "style_config": {{"framework": "{request.style_framework}", "theme": {{}}, "custom_css": null}}
                    }}"""
                    continue
                else:
                    # Final fallback: create a minimal ADO
                    return self._create_fallback_ado(request)
            
            except Exception as e:
                print(f"ADO generation failed on attempt {attempt + 1}: {str(e)}")
                if attempt == max_retries - 1:
                    return self._create_fallback_ado(request)
        
        return self._create_fallback_ado(request)
    
    def _create_fallback_ado(self, request: GenerationRequest) -> ApplicationDefinitionObject:
        """Create a minimal fallback ADO when generation fails"""
        from schemas.application_definition import (
            FileDefinition, ComponentDefinition, Dependency, StyleConfig, FileType, ComponentType, StyleFramework
        )
        
        return ApplicationDefinitionObject(
            name="fallback-app",
            description=f"Generated app for: {request.prompt}",
            framework=request.framework,
            files=[
                FileDefinition(
                    path="package.json",
                    type=FileType.JSON,
                    content="",
                    description="Package configuration"
                ),
                FileDefinition(
                    path="src/App.jsx",
                    type=FileType.JSX,
                    content="",
                    description="Main application component",
                    component="App"
                )
            ],
            components=[
                ComponentDefinition(
                    name="App",
                    type=ComponentType.FUNCTIONAL,
                    file_path="src/App.jsx",
                    imports=["react"],
                    exports=["default"],
                    description="Main application component"
                )
            ],
            dependencies=[
                Dependency(name="react", version="^18.2.0", dev=False),
                Dependency(name="react-dom", version="^18.2.0", dev=False)
            ],
            style_config=StyleConfig(framework=request.style_framework)
        )
    
    async def modify_ado(self, request: ModificationRequest) -> ApplicationDefinitionObject:
        """Modify an existing ADO based on user request"""
        
        current_ado_json = request.current_ado.model_dump()
        
        modification_prompt = f"""
        Modify the following Application Definition Object based on the user's request:
        
        Current ADO:
        {json.dumps(current_ado_json, indent=2)}
        
        User Request: "{request.modification_prompt}"
        
        Files to modify: {request.files_to_modify or "Auto-detect"}
        Preserve structure: {request.preserve_structure}
        
        Return the complete modified ADO as JSON with the same structure.
        
        Rules:
        1. Only modify what the user requested
        2. Maintain existing component relationships
        3. Update dependencies if new features require them
        4. Preserve existing styling framework unless explicitly changed
        5. Keep file structure consistent
        
        Return only the JSON object.
        """
        
        response = await self._generate_with_retry(modification_prompt)
        
        try:
            json_str = self._extract_json(response.text)
            ado_data = json.loads(json_str)
            
            # Fix common validation issues
            ado_data = self._fix_ado_validation_issues(ado_data)
            
            modified_ado = ApplicationDefinitionObject(**ado_data)
            return modified_ado
            
        except Exception as e:
            raise Exception(f"Failed to modify ADO: {str(e)}")
    
    async def generate_files_from_ado(self, ado: ApplicationDefinitionObject) -> Dict[str, str]:
        """Generate actual file contents from an ADO"""
        files = {}
        
        for file_def in ado.files:
            if file_def.content and file_def.content.strip():
                # Content already exists in ADO
                files[file_def.path] = file_def.content
            else:
                # Generate content for this file
                content = await self._generate_file_content(file_def, ado)
                files[file_def.path] = content
        
        return files
    
    async def _generate_file_content(self, file_def: FileDefinition, ado: ApplicationDefinitionObject) -> str:
        """Generate content for a specific file based on the ADO context"""
        
        # Get component info if this file contains a component
        component_info = None
        if file_def.component:
            component_info = next(
                (comp for comp in ado.components if comp.name == file_def.component), 
                None
            )
        
        content_prompt = f"""
        Generate complete code for file: {file_def.path}
        
        File type: {file_def.type}
        Description: {file_def.description or "N/A"}
        
        Application context:
        - Name: {ado.name}
        - Framework: {ado.framework}
        - Style framework: {ado.style_config.framework}
        
        Component info: {component_info.model_dump() if component_info else 'N/A'}
        
        Available components: {[comp.name for comp in ado.components]}
        
        Dependencies: {[dep.name for dep in ado.dependencies]}
        
        Rules:
        1. Generate complete, functional code
        2. Use {ado.style_config.framework} for styling
        3. Include all necessary imports
        4. Follow modern best practices
        5. Make it responsive and accessible
        6. No placeholder comments
        
        Return only the file content.
        """
        
        response = await self._generate_with_retry(content_prompt)
        return response.text.strip()
    
    async def _generate_with_retry(self, prompt: str, max_retries: int = 3) -> any:
        """Generate content with retry logic"""
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(prompt)
                if response.text:
                    return response
                else:
                    raise Exception("Empty response from model")
            except Exception as e:
                if attempt == max_retries - 1:
                    raise e
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
        
        raise Exception("Max retries exceeded")
    
    def _extract_json(self, text: str) -> str:
        """Extract and clean JSON from model response"""
        import re
        
        text = text.strip()
        
        # Remove markdown code blocks
        if "```" in text:
            # Extract content between code blocks
            code_block_pattern = r'```(?:json)?\s*\n?(.*?)\n?```'
            match = re.search(code_block_pattern, text, re.DOTALL | re.IGNORECASE)
            if match:
                text = match.group(1).strip()
        
        # Find JSON boundaries with proper bracket counting
        start = -1
        bracket_count = 0
        
        for i, char in enumerate(text):
            if char == '{':
                if start == -1:
                    start = i
                bracket_count += 1
            elif char == '}':
                bracket_count -= 1
                if bracket_count == 0 and start != -1:
                    end = i + 1
                    json_str = text[start:end]
                    
                    # Validate that it's proper JSON
                    try:
                        import json
                        json.loads(json_str)
                        return json_str
                    except json.JSONDecodeError:
                        # Continue searching for valid JSON
                        start = -1
                        bracket_count = 0
                        continue
        
        # Fallback: try to find any JSON-like structure
        json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
        matches = re.findall(json_pattern, text, re.DOTALL)
        
        for match in matches:
            try:
                import json
                json.loads(match)
                return match
            except json.JSONDecodeError:
                continue
        
        raise Exception("No valid JSON object found in response")

    def _fix_ado_validation_issues(self, json_data: dict) -> dict:
        """Fix common validation issues in ADO JSON data"""
        print("🔧 Fixing ADO validation issues...")
        
        # Fix component props - convert strings to proper ComponentProp objects
        if "components" in json_data:
            for component in json_data["components"]:
                if "props" in component and isinstance(component["props"], list):
                    fixed_props = []
                    for prop in component["props"]:
                        if isinstance(prop, str):
                            # Convert string prop to proper ComponentProp object
                            fixed_props.append({
                                "name": prop,
                                "type": "string",
                                "required": False,
                                "default_value": "",
                                "description": f"Property: {prop}"
                            })
                        elif isinstance(prop, dict):
                            # Ensure all required fields are present
                            prop_obj = {
                                "name": prop.get("name", "unknown"),
                                "type": prop.get("type", "string"),
                                "required": prop.get("required", False),
                                "default_value": prop.get("default_value", ""),
                                "description": prop.get("description", "")
                            }
                            fixed_props.append(prop_obj)
                        else:
                            fixed_props.append(prop)
                    component["props"] = fixed_props
        
        # Fix style_config framework enum values
        if "style_config" in json_data and "framework" in json_data["style_config"]:
            framework = json_data["style_config"]["framework"]
            # Remove enum prefixes like "StyleFramework.TAILWIND"
            if isinstance(framework, str) and "." in framework:
                framework = framework.split(".")[-1].lower()
                # Map to valid enum values
                framework_map = {
                    "tailwind": "tailwindcss",
                    "tailwindcss": "tailwindcss",
                    "styled": "styled-components",
                    "emotion": "emotion",
                    "cssmodules": "css-modules",
                    "css": "css"
                }
                json_data["style_config"]["framework"] = framework_map.get(framework, "tailwindcss")
        
        # Ensure file types are valid
        if "files" in json_data:
            valid_file_types = {"js", "jsx", "tsx", "ts", "css", "scss", "json", "html", "md"}
            for file_obj in json_data["files"]:
                if "type" in file_obj and file_obj["type"] not in valid_file_types:
                    # Try to infer from file extension
                    path = file_obj.get("path", "")
                    if path.endswith((".js", ".mjs")):
                        file_obj["type"] = "js"
                    elif path.endswith(".jsx"):
                        file_obj["type"] = "jsx"
                    elif path.endswith(".ts"):
                        file_obj["type"] = "ts"
                    elif path.endswith(".tsx"):
                        file_obj["type"] = "tsx"
                    elif path.endswith(".css"):
                        file_obj["type"] = "css"
                    elif path.endswith(".scss"):
                        file_obj["type"] = "scss"
                    elif path.endswith(".json"):
                        file_obj["type"] = "json"
                    elif path.endswith(".html"):
                        file_obj["type"] = "html"
                    elif path.endswith(".md"):
                        file_obj["type"] = "md"
                    else:
                        file_obj["type"] = "js"  # Default fallback
        
        # Ensure component types are valid
        if "components" in json_data:
            valid_component_types = {"functional", "class", "page", "layout", "hook", "utility"}
            for component in json_data["components"]:
                if "type" in component and component["type"] not in valid_component_types:
                    component["type"] = "functional"  # Default fallback
        
        print("✅ ADO validation issues fixed")
        return json_data

class ADOValidator:
    """Validates and enriches Application Definition Objects"""
    
    @staticmethod
    def validate_ado(ado: ApplicationDefinitionObject) -> List[str]:
        """Validate ADO and return list of issues"""
        issues = []
        
        # Check for required files
        file_paths = [f.path for f in ado.files]
        if "package.json" not in file_paths:
            issues.append("Missing package.json file")
        
        # Check component consistency
        component_files = {comp.file_path for comp in ado.components}
        jsx_files = {f.path for f in ado.files if f.type in [FileType.JSX, FileType.TSX]}
        
        for comp_file in component_files:
            if comp_file not in jsx_files:
                issues.append(f"Component file {comp_file} not found in files list")
        
        # Check dependency consistency
        required_deps = set()
        if ado.framework == "react":
            required_deps.update(["react", "react-dom"])
        
        declared_deps = {dep.name for dep in ado.dependencies}
        missing_deps = required_deps - declared_deps
        
        for dep in missing_deps:
            issues.append(f"Missing required dependency: {dep}")
        
        return issues
    
    @staticmethod
    def enrich_ado(ado: ApplicationDefinitionObject) -> ApplicationDefinitionObject:
        """Enrich ADO with missing standard configurations"""
        
        # Add standard React dependencies if missing
        if ado.framework == "react":
            dep_names = {dep.name for dep in ado.dependencies}
            
            standard_deps = [
                Dependency(name="react", version="^18.2.0"),
                Dependency(name="react-dom", version="^18.2.0"),
            ]
            
            for dep in standard_deps:
                if dep.name not in dep_names:
                    ado.dependencies.append(dep)
        
        # Add Tailwind if specified
        if ado.style_config.framework == "tailwindcss":
            dep_names = {dep.name for dep in ado.dependencies}
            tailwind_deps = [
                Dependency(name="tailwindcss", version="^3.3.0", dev=True),
                Dependency(name="autoprefixer", version="^10.4.14", dev=True),
                Dependency(name="postcss", version="^8.4.24", dev=True),
            ]
            
            for dep in tailwind_deps:
                if dep.name not in dep_names:
                    ado.dependencies.append(dep)
        
        return ado
