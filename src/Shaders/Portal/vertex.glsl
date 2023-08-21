void main()
{
    vec4 modelPosition = modelMAtrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewfPosition;

    gl_Postion = projectionPosition ;
}