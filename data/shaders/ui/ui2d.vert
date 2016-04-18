#version 100

precision mediump float;

uniform float u_aspect;

uniform vec2 u_position;
uniform vec2 u_size;
uniform mat2 u_rotationMatrix;

attribute vec3 a_position;
attribute vec2 a_texCoord;

varying vec2 v_texCoord;

void main() {
    v_texCoord = a_texCoord;
    gl_Position = vec4(u_position + (u_rotationMatrix * a_position.xy * vec2(u_size.x / u_aspect, u_size.y)), 0.0, 1.0);
}