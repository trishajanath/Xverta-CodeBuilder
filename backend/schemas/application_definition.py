from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
from enum import Enum

class ComponentType(str, Enum):
    """Supported component types"""
    FUNCTIONAL = "functional"
    CLASS = "class"
    PAGE = "page"
    LAYOUT = "layout"
    HOOK = "hook"
    UTILITY = "utility"

class FileType(str, Enum):
    """Supported file types"""
    JAVASCRIPT = "js"
    TYPESCRIPT = "ts"
    JSX = "jsx"
    TSX = "tsx"
    CSS = "css"
    SCSS = "scss"
    JSON = "json"
    HTML = "html"
    MARKDOWN = "md"

class StyleFramework(str, Enum):
    """Supported styling frameworks"""
    TAILWIND = "tailwindcss"
    STYLED_COMPONENTS = "styled-components"
    EMOTION = "emotion"
    CSS_MODULES = "css-modules"
    VANILLA_CSS = "css"

class Dependency(BaseModel):
    """Package dependency definition"""
    name: str
    version: str
    dev: bool = False

class StyleConfig(BaseModel):
    """Styling configuration"""
    framework: StyleFramework = StyleFramework.TAILWIND
    theme: Dict[str, Any] = Field(default_factory=dict)
    custom_css: Optional[str] = None

class ComponentProp(BaseModel):
    """Component prop definition"""
    name: str
    type: str  # "string", "number", "boolean", "object", "array", "function"
    required: bool = False
    default_value: Optional[Any] = None
    description: Optional[str] = None

class ComponentDefinition(BaseModel):
    """Individual component definition"""
    name: str
    type: ComponentType
    file_path: str
    props: List[ComponentProp] = Field(default_factory=list)
    imports: List[str] = Field(default_factory=list)
    exports: List[str] = Field(default_factory=list)
    description: Optional[str] = None
    dependencies: List[str] = Field(default_factory=list)  # Component dependencies
    
class RouteDefinition(BaseModel):
    """Route definition for SPA"""
    path: str
    component: str
    exact: bool = True
    protected: bool = False
    meta: Dict[str, Any] = Field(default_factory=dict)

class StateDefinition(BaseModel):
    """Application state definition"""
    name: str
    type: str  # "local", "context", "redux", "zustand"
    initial_value: Any
    actions: List[str] = Field(default_factory=list)

class APIEndpoint(BaseModel):
    """API endpoint definition"""
    path: str
    method: str  # GET, POST, PUT, DELETE
    description: Optional[str] = None
    request_schema: Optional[Dict[str, Any]] = None
    response_schema: Optional[Dict[str, Any]] = None

class FileDefinition(BaseModel):
    """File structure definition"""
    path: str
    type: FileType
    content: str
    description: Optional[str] = None
    component: Optional[str] = None  # If file contains a component

class ApplicationDefinitionObject(BaseModel):
    """
    Complete Application Definition Object (ADO)
    This is the structured format that AI targets when generating applications
    """
    # Meta information
    name: str
    version: str = "1.0.0"
    description: Optional[str] = None
    framework: str = "react"  # react, vue, angular, etc.
    
    # Project structure
    files: List[FileDefinition] = Field(default_factory=list)
    components: List[ComponentDefinition] = Field(default_factory=list)
    routes: List[RouteDefinition] = Field(default_factory=list)
    
    # Dependencies and configuration
    dependencies: List[Dependency] = Field(default_factory=list)
    style_config: StyleConfig = Field(default_factory=StyleConfig)
    
    # Application state
    state_definitions: List[StateDefinition] = Field(default_factory=list)
    
    # API definitions (for full-stack apps)
    api_endpoints: List[APIEndpoint] = Field(default_factory=list)
    
    # Build and deployment configuration
    build_config: Dict[str, Any] = Field(default_factory=dict)
    
    # Metadata for AI generation
    generation_metadata: Dict[str, Any] = Field(default_factory=dict)

class GenerationRequest(BaseModel):
    """Request model for AI generation"""
    prompt: str
    framework: str = "react"
    style_framework: StyleFramework = StyleFramework.TAILWIND
    additional_requirements: List[str] = Field(default_factory=list)
    target_ado: Optional[ApplicationDefinitionObject] = None  # For modifications

class ModificationRequest(BaseModel):
    """Request model for modifying existing application"""
    modification_prompt: str
    current_ado: ApplicationDefinitionObject
    files_to_modify: Optional[List[str]] = None  # Specific files to target
    preserve_structure: bool = True  # Whether to maintain overall structure

class GenerationResponse(BaseModel):
    """Response model for AI generation"""
    success: bool
    ado: Optional[ApplicationDefinitionObject] = None
    files: Dict[str, str] = Field(default_factory=dict)  # file_path -> content
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    generation_metadata: Dict[str, Any] = Field(default_factory=dict)
