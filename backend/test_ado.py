"""
Simple test script to verify ADO generation works correctly
"""
import asyncio
import os
from dotenv import load_dotenv
from services.ado_generator import ADOGenerator
from schemas.application_definition import GenerationRequest, StyleFramework

async def test_ado_generation():
    """Test ADO generation with a simple prompt"""
    
    # Load environment variables
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        print("❌ No GOOGLE_API_KEY found. Please set it in .env file")
        return
    
    if api_key == "your_gemini_api_key_here":
        print("❌ Please replace the placeholder API key in .env file with your actual Google AI API key")
        return
    
    print("🧪 Testing ADO generation...")
    
    try:
        # Initialize generator
        generator = ADOGenerator(api_key)
        
        # Create test request
        request = GenerationRequest(
            prompt="A simple todo app with add, delete, and mark complete functionality",
            framework="react",
            style_framework=StyleFramework.TAILWIND
        )
        
        print(f"📝 Generating ADO for: {request.prompt}")
        
        # Generate ADO
        ado = await generator.generate_ado_from_prompt(request)
        
        print("✅ ADO generated successfully!")
        print(f"   App Name: {ado.name}")
        print(f"   Framework: {ado.framework}")
        print(f"   Files: {len(ado.files)} files")
        print(f"   Components: {len(ado.components)} components")
        print(f"   Dependencies: {len(ado.dependencies)} dependencies")
        
        # Test file generation
        print("\n📄 Testing file generation...")
        files = await generator.generate_files_from_ado(ado)
        
        print(f"✅ Generated {len(files)} files:")
        for file_path in files.keys():
            print(f"   - {file_path}")
        
        print("\n🎉 All tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ado_generation())
