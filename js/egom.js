"use strict";

/**
 * @fileOverview This file provides limited functionality to interact with
 * EgomModel 3D models, including loading the data from EgomModel XML files.
 * EgomModel is a simple 3D modeling library written in object pascal.
 * @author <a href="mailto:nkrisztian89@gmail.com">Krisztián Nagy</a>
 * @version 0.1-dev
 */

/**********************************************************************
 Copyright 2014 Krisztián Nagy
 
 This file is part of Interstellar Armada.
 
 Interstellar Armada is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 Interstellar Armada is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Interstellar Armada.  If not, see <http://www.gnu.org/licenses/>.
 ***********************************************************************/

/**
 * @namespace A namespace the provides a model class and several functions for
 * returning 3D models with simple structures.
 */
var Egom = Egom || (function () {
    /**
     * The list of EgomModel versions that can be loaded from file.
     * @type String[]
     */
    var _supportedVersions = ["2.0", "2.1"];

    /**
     * @name Vertex
     * @alias Egom.Vertex
     * @private
     * @class Represents a vertex in 3D space.
     * @param {Number[3]} position Position vector.
     * @param {Number[2]} texCoords Texture coordinates.
     * @returns {Vertex}
     */
    function Vertex(position, texCoords) {
        /**
         * The X coordinate of the vertex.
         * @name Vertex#x
         * @type Number
         */
        this.x = position[0];
        /**
         * The Y coordinate of the vertex.
         * @name Vertex#y
         * @type Number
         */
        this.y = position[1];
        /**
         * The Z coordinate of the vertex.
         * @name Vertex#z
         * @type Number
         */
        this.z = position[2];
        // if no texture coordinates were given, default to (x;y)
        texCoords = texCoords || [this.x, this.y];
        /**
         * The U (horizontal) texture coordinate of the vertex.
         * @name Vertex#u
         * @type Number
         */
        this.u = texCoords[0];
        /**
         * The V (vertical) texture coordinate of the vertex.
         * @name Vertex#v
         * @type Number
         */
        this.v = texCoords[1];
    }

    /**
     * Returns the texture coordinates associated with this vertex.
     * @returns {Number[2]}
     */
    Vertex.prototype.getTexCoords = function () {
        return [this.u, this.v];
    };

    /**
     * Sets the X coordinate of the vertex.
     * @param {Number} x
     */
    Vertex.prototype.setX = function (x) {
        this.x = x;
    };

    /**
     * Sets the Y coordinate of the vertex.
     * @param {Number} y
     */
    Vertex.prototype.setY = function (y) {
        this.y = y;
    };

    /**
     * Sets the Z coordinate of the vertex.
     * @param {Number} z
     */
    Vertex.prototype.setZ = function (z) {
        this.z = z;
    };

    /**
     * @name Line
     * @alias Egom.Line
     * @private
     * @class Represents a line connecting two vertices in a model.
     * @param {Number} a The index of the starting vertex of the line.
     * @param {Number} b The index of the end vertex of the line.
     * @param {Number[3]} color The color of the line. ([red, green, blue])
     * @param {Number} luminosity The luminosity of the line. (0.0-1.0)
     * @param {Number[3]} normal The normal vector associated with the line.
     * @returns {Line}
     */
    function Line(a, b, color, luminosity, normal) {
        /**
         * The index (in the model) of the starting vertex of the line.
         * @name Line#a
         * @type Number
         */
        this.a = a;
        /**
         * The index (in the model) of the end vertex of the line.
         * @name Line#b
         * @type Number
         */
        this.b = b;
        /**
         * The color of the line for rendering. ([red, green, blue])
         * @name Line#color
         * @type Number
         */
        this.color = color;
        /**
         * The luminosity of the line for rendering. (0.0-1.0)
         * @name Line#luminosity
         * @type Number
         */
        this.luminosity = luminosity;
        /**
         * The normal vector associated with the line for shading.
         * @name Line#normal
         * @type Number[3]
         */
        this.normal = normal;
    }

    /**
     * @name Triangle
     * @alias Egom.Triangle
     * @private
     * @class Represents a triangular face between 3 vertices of a model.
     * @param {Model} model The model to which this triangle is added.
     * @param {Number} a The index of the first vertex.
     * @param {Number} b The index of the second vertex.
     * @param {Number} c The index of the third vertex.
     * @param {Number[4]} color The color of the triangle. ([red, green, blue, alpha])
     * @param {Number} luminosity The luminosity of the triangle. (0.0-1.0)
     * @param {Number} shininess The shininess (exponent) of the triangle.
     * @param {Number[3][2]} texCoords The texture coordinates of the triangle's 
     * vertices. Format: [[a.u,a.v],[b.u,b.v],[c.u,c.v]]
     * @param {Number[][3]} [normals] The normal vectors of the triangle's vertices.
     * If the three vertives are the same, it is enough to pass an array with only
     * one element.
     * @param {Number} [groupIndex] The index of the group this triangle belongs to.
     * @returns {Triangle}
     */
    function Triangle(model, a, b, c, color, luminosity, shininess, texCoords, normals, groupIndex) {
        /**
         * The model to which this triangle is added.
         * @name Triangle#_model
         * @type Model
         */
        this._model = model;
        /**
         * The index (in the model) of the first vertex of the triangle.
         * @name Triangle#a
         * @type Number
         */
        this.a = a;
        /**
         * The index (in the model) of the second vertex of the triangle.
         * @name Triangle#b
         * @type Number
         */
        this.b = b;
        /**
         * The index (in the model) of the third vertex of the triangle.
         * @name Triangle#c
         * @type Number
         */
        this.c = c;
        /**
         * The RGBA color of the triangle. ([red, green, blue, alpha])
         * @name Triangle#color
         * @type Number[4]
         */
        this.color = color;
        /**
         * The luminosity of the triangle. (0.0-1.0)
         * @name Triangle#luminosity
         * @type Number
         */
        this.luminosity = luminosity;
        /**
         * The shininess (exponent) of the triangle for phong shading.
         * @name Triangle#shininess
         * @type Number
         */
        this.shininess = shininess;
        /**
         * The texture coordinates of the triangle's vertices. Format: 
         * [[a.u,a.v],[b.u,b.v],[c.u,c.v]]
         * @name Triangle#texCoords
         * @type Number[3][2]
         */
        this.texCoords = texCoords;
        /**
         * The normal vector(s) of the triangle's vertices. May have one (uniform
         * normal across the triangle) or three (different normal per vertex)
         * elements.
         * @name Triangle#_normals
         * @type Number[][3]
         */
        this._normals = normals || Vec.normal3(Vec.cross3(this._model.getVector(a, b), this._model.getVector(a, c)));
        /**
         * The index of the group this triangle belongs to. (for setting different
         * uniform values for certain triangle groups of the model while rendering)
         * @name Triangle#groupIndex
         * @type Number
         */
        this.groupIndex = groupIndex || 0;
    }

    /**
     * Returns the normal vector belonging to one of the vertices of this triangle.
     * @param {Number} index The index of the vertex (within the triangle: 0,1 or 2)
     * @returns {Number[3]}
     */
    Triangle.prototype.getNormal = function (index) {
        return (this._normals[index] ?
                this._normals[index] :
                this._normals[0]);
    };

    /**
     * @class Stores the attributes that a model has associated with a managed
     * WebGL context.
     * @returns {ModelContextProperties}
     */
    function ModelContextProperties() {
        /**
         * Whether the wireframe model is used in the context.
         * @name ModelContextProperties#wireframe
         * @type Boolean
         */
        this.wireframe = null;
        /**
         * Whether the solid model is used in the context.
         * @name ModelContextProperties#wireframe
         * @type Boolean
         */
        this.solid = null;
        /**
         * The index marking where the data belonging to the lines of this 
         * model starts in the vertex buffer objects.
         * @name ModelContextProperties#bufferStartWireframe
         * @type Number
         */
        this.bufferStartWireframe = null;
        /**
         * The index marking where the data belonging to the triangles of this 
         * model starts in the vertex buffer objects.
         * @name ModelContextProperties#bufferStartSolid
         * @type Number
         */
        this.bufferStartSolid = null;
        /**
         * The index marking where the data belonging to the transparent 
         * triangles of this model starts in the vertex buffer objects.
         * @name ModelContextProperties#bufferStartTransparent
         * @type Number
         */
        this.bufferStartTransparent = null;
    }

    /**
     * Creates a new 3D model object, and if a file name was given, loads the data
     * from the file. Only Egom XML format is supported.
     * @name Model
     * @alias Egom.Model
     * @class Represents a 3D polygonal model.
     * @extends Resource
     * @param {String} [filename] The name of the file to load the model from.
     */
    function Model(filename) {
        Resource.call(this);
        /**
         * The array of vertices of the model. These can be referenced by index
         * when defining lines or triangles.
         * @name Model#_vertices
         * @type Vertex[]
         */
        this._vertices = new Array();
        /**
         * The array of lines of the model for wireframe rendering.
         * @name Model#_lines
         * @type Line[]
         */
        this._lines = new Array();
        /**
         * The array of triangles of the model for solid rendering.
         * @name Model#_triangles
         * @type Triangle[]
         */
        this._triangles = new Array();
        /**
         * The size of the model. It is the double of the (absolute) largest coordinate
         * found among the vertices.
         * @name Model#_size
         * @type Number
         */
        this._size = 0;
        /**
         * The largest positive X coordinate found among the vertices.
         * @name Model#_maxX
         * @type Number
         */
        this._maxX = 0;
        /**
         * The largest negative X coordinate found among the vertices.
         * @name Model#_minX
         * @type Number
         */
        this._minX = 0;
        /**
         * The largest positive Y coordinate found among the vertices.
         * @name Model#_maxY
         * @type Number
         */
        this._maxY = 0;
        /**
         * The largest negative Y coordinate found among the vertices.
         * @name Model#_minY
         * @type Number
         */
        this._minY = 0;
        /**
         * The largest positive Z coordinate found among the vertices.
         * @name Model#_maxZ
         * @type Number
         */
        this._maxZ = 0;
        /**
         * The largest negative Z coordinate found among the vertices.
         * @name Model#_minZ
         * @type Number
         */
        this._minZ = 0;
        /**
         * The number of opaque triangles this model contains.
         * @name Model#_nOpaqueTriangles
         * @type Number
         */
        this._nOpaqueTriangles = 0;
        /**
         * The number of transparent triangles this model contains.
         * @name Model#_nTransparentTriangles
         * @type Number
         */
        this._nTransparentTriangles = 0;
        /**
         * The name of this model.
         * @name Model#_name
         * @type String
         */
        this._name = null;
        /**
         * The name of the file that holds this model.
         * @name Model#_filename
         * @type String
         */
        this._filename = filename;
        /**
         * The version string identifying the exact format of the model file.
         * @name Model#_version
         * @type String
         */
        this._version = null;
        // if no filename was specified, the model is set up to be edited from code
        // and can be used any time from now, otherwise we should wait until the
        // file is loaded
        if (!filename) {
            this.setToReady();
        }
        /**
         * The default luminosity value for newly added lines and triangles.
         * @name Model#_luminosity
         * @type Number
         */
        this._luminosity = 0;
        /**
         * The default shininess value for newly added lines and triangles.
         * @name Model#_shininess
         * @type Number
         */
        this._shininess = 0;
        /**
         * The default texture coordinates for newly added triangles and quads.
         * @name Model#_texCoords
         * @type Number[4][2]
         */
        this._texCoords = [[0, 1], [1, 1], [1, 0], [0, 0]];
        /**
         * The default group index for newly added triangles and lines.
         * @name Model#_currentGroupIndex
         * @type Number
         */
        this._currentGroupIndex = 0;
        /**
         * The object storing the info (meta) properties of the model.
         * @name Model#_infoProperties
         * @type Object
         */
        this._infoProperties = new Object();
        /**
         * The length of one model-space unit in meters.
         * @name Model#_scale
         * @type Number
         */
        this._scale = 1;
        /**
         * An associative array storing ModelContextProperties objects for each
         * context this model is associated with, organized by the names of the
         * contexts.
         * @name Model#_contextProperties
         * @type Object
         */
        this._contextProperties = new Object();
    }

    Model.prototype = new Resource();
    Model.prototype.constructor = Model;

    /**
     * Returns the name of the model. (not the same as the filename - a name can be
     * set directly, or read from the model file)
     * @returns {String}
     */
    Model.prototype.getName = function () {
        return this._name;
    };

    /**
     * Sets a name for the model.
     * @param {String} name
     */
    Model.prototype.setName = function (name) {
        this._name = name;
    };

    /**
     * Returns the associated model file name.
     * @returns {String}
     */
    Model.prototype.getFilename = function () {
        return this._filename;
    };

    /**
     * Returns the number of completely opaque triangles this model contains.
     * @returns {Number}
     */
    Model.prototype.getNumOpaqueTriangles = function () {
        return this._nOpaqueTriangles;
    };

    /**
     * Returns the number of transparent (not completely opaque) triangles this 
     * model contains.
     * @returns {Number}
     */
    Model.prototype.getNumTransparentTriangles = function () {
        return this._nTransparentTriangles;
    };

    /**
     * Sets the vertex data belonging to the passed index.
     * @param {Number} index The index of the vertex to create/overwrite. Can
     * be bigger than the currently available indices, in which case the needed
     * new vertices will be created at (0;0;0).
     * @param {Number[3]} position Coordinates of the vertex to set.
     * @param {Number[2]} [texCoords] Texture coordinates of the vertex to set.
     */
    Model.prototype.setVertex = function (index, position, texCoords) {
        // if we are setting a vertex with a higher index than the currently stored
        // ones, create new vertices in between
        if (this._vertices.length < index) {
            for (var i = this._vertices.length; i < index; i++) {
                this._vertices[i] = new Vertex([0.0, 0.0, 0.0]);
            }
        }
        // set the vertex
        this._vertices[index] = new Vertex(position, texCoords);
        // update the size related data
        if (Math.abs(this._vertices[index].x * 2) > this._size) {
            this._size = Math.abs(this._vertices[index].x * 2);
        }
        if (Math.abs(this._vertices[index].y * 2) > this._size) {
            this._size = Math.abs(this._vertices[index].y * 2);
        }
        if (Math.abs(this._vertices[index].z * 2) > this._size) {
            this._size = Math.abs(this._vertices[index].z * 2);
        }
        if (this._vertices[index].x > this._maxX) {
            this._maxX = this._vertices[index].x;
        }
        if (this._vertices[index].x < this._minX) {
            this._minX = this._vertices[index].x;
        }
        if (this._vertices[index].y > this._maxY) {
            this._maxY = this._vertices[index].y;
        }
        if (this._vertices[index].y < this._minY) {
            this._minY = this._vertices[index].y;
        }
        if (this._vertices[index].z > this._maxZ) {
            this._maxZ = this._vertices[index].z;
        }
        if (this._vertices[index].z < this._minZ) {
            this._minZ = this._vertices[index].z;
        }
    };

    /**
     * Adds a new vertex to the first available index.
     * @param {Number[3]} position
     * @param {Number[2]} [texCoords]
     */
    Model.prototype.appendVertex = function (position, texCoords) {
        this.setVertex(this._vertices.length, position, texCoords);
    };

    /**
     * Returns a vector pointing from one vertex to the other.
     * @param {Vertex} vertex1Index The index of the vertex that is at the origin of
     * the vector.
     * @param {Vertex} vertex2Index The index of the vertex that is at the descitation
     * of the vector.
     * @returns {Number[3]}
     */
    Model.prototype.getVector = function (vertex1Index, vertex2Index) {
        return [
            this._vertices[vertex2Index].x - this._vertices[vertex1Index].x,
            this._vertices[vertex2Index].y - this._vertices[vertex1Index].y,
            this._vertices[vertex2Index].z - this._vertices[vertex1Index].z];
    };

    /**
     * Sets the default properties for newly added lines and triangles.
     * @param {Number} luminosity The default luminosity value (0.0-1.0) to use
     * from now on.
     * @param {Number} shininess The default shininess exponent value to use from
     * now on.
     */
    Model.prototype.setDefaultProperties = function (luminosity, shininess) {
        this._luminosity = luminosity;
        this._shininess = shininess;
    };

    /**
     * Adds a new triangle to the model.
     * @param {Number} a The index of the first vertex of the triangle.
     * @param {Number} b The index of the second vertex of the triangle.
     * @param {Number} c The index of the third vertex of the triangle.
     * @param {Object} params The parameters of the triangle. Can have the following
     * properties:<br/>
     * color (Number[4]): The color of the triangle<br/>
     * luminosity (Number): The luminosity of the triangle<br/>
     * shininess (Number): The shininess of the triangl
     * useVertexTexCoords (Boolean): Whether to take the texture coordinates from the
     * vertices of the model (if not, the default ones set for the model or the
     * custom ones given here will be used)<br/>
     * texCoords (Number[3][2]): The texture coordinates of the vertices of the 
     * triangle<br/>
     * normals (Number[][3]): The normal vector(s) for the triangle. If one vector
     * is given, it will be used for all three vertices, if 3 are given, they will
     * be used separately. If none are given, the normal of th surface of the 
     * triangles will be generated and used.<br/>
     * groupIndex (Number): The index of the groups to which to add the triangle.
     */
    Model.prototype.addTriangle = function (a, b, c, params) {
        // the default color is opaque white
        var color = params.color || [1.0, 1.0, 1.0, 1.0];
        // if not specified, use the model's default luminosity/shininess
        var luminosity = params.luminosity || this._luminosity;
        var shininess = params.shininess || this._shininess;
        // texture coordinates may be taken from the vertices, from the parameters
        // passed to this function or from the default coordinates set for the model
        var texCoords = params.useVertexTexCoords ?
                [this._vertices[a].getTexCoords(), this._vertices[b].getTexCoords(), this._vertices[c].getTexCoords()] :
                (params.texCoords ?
                        params.texCoords :
                        [this._texCoords[0], this._texCoords[1], this._texCoords[2]]);
        // normals are taken from the parameters - can be 1 or 3 element long
        var normals = params.normals;
        // if not specified, use the model's default group index
        var groupIndex = params.groupIndex || this._currentGroupIndex;
        // create and add the new triangle
        this._triangles.push(new Triangle(this, a, b, c, color, luminosity, shininess, texCoords, normals, groupIndex));
        // the default setting is to also add the corresponding border lines of the triangle
        if (!params.withoutLines) {
            this._lines.push(new Line(a, b, color, luminosity, normals ? normals[0] : null));
            this._lines.push(new Line(b, c, color, luminosity, normals ? normals[0] : null));
            this._lines.push(new Line(c, a, color, luminosity, normals ? normals[0] : null));
        }
        // important to update the appropriate count
        (color[3] < 1.0) ?
                this._nTransparentTriangles++ :
                this._nOpaqueTriangles++;
    };

    /**
     * Adds two triangles forming a quadrilateral between 4 vertices.
     * @param {Number} a The index of the first vertex of the quad.
     * @param {Number} b The index of the second vertex of the quad.
     * @param {Number} c The index of the third vertex of the quad.
     * @param {Number} d The index of the fourth vertex of the quad.
     * @param {Object} params The parameters of the quad in the same format as with
     * single triangles.
     * @see Model#addTriangle
     */
    Model.prototype.addQuad = function (a, b, c, d, params) {
        params = params || {};
        // adding the first triangle
        // first, create the approrpiate parameters for the triangle based on the
        // parameters given for the quad
        var triangle1Params = Object.create(params);
        // no lines should be added, as we will add the 4 lines for the whole quad
        // in the end
        triangle1Params.withoutLines = true;
        // for texture coordinates and normals, the first 3 values need to be used
        triangle1Params.texCoords = params.useVertexTexCoords ?
                [this._vertices[a].getTexCoords(), this._vertices[b].getTexCoords(), this._vertices[c].getTexCoords()] :
                (params.texCoords ?
                        [params.texCoords[0], params.texCoords[1], params.texCoords[2]] :
                        [this._texCoords[0], this._texCoords[1], this._texCoords[2]]);
        triangle1Params.normals = params.normals ?
                (params.normals.length === 4 ?
                        [params.normals[0], params.normals[1], params.normals[2]] :
                        params.normals) :
                null;
        this.addTriangle(a, b, c, triangle1Params);
        // adding the first triangle
        var triangle2Params = Object.create(params);
        triangle2Params.texCoords = params.useVertexTexCoords ?
                [this._vertices[c].getTexCoords(), this._vertices[d].getTexCoords(), this._vertices[a].getTexCoords()] :
                (params.texCoords ?
                        [params.texCoords[2], params.texCoords[3], params.texCoords[0]] :
                        [this._texCoords[2], this._texCoords[3], this._texCoords[0]]);
        triangle2Params.normals = params.normals ?
                (params.normals.length === 4 ?
                        [params.normals[2], params.normals[3], params.normals[0]] :
                        params.normals) :
                null;
        this.addTriangle(c, d, a, triangle2Params);
        // adding the 4 lines around the quad
        if (!params.withoutLines) {
            var color = params.color || [1.0, 1.0, 1.0, 1.0];
            var luminosity = params.luminosity || this._luminosity;
            var normals = params.normals ? params.normals[0] : null;
            this._lines.push(new Line(a, b, color, luminosity, normals));
            this._lines.push(new Line(b, c, color, luminosity, normals));
            this._lines.push(new Line(c, d, color, luminosity, normals));
            this._lines.push(new Line(d, a, color, luminosity, normals));
        }
    };

    /**
     * Issues an asynchronous request to grab the file containing the model data,
     * and sets a callback to load the data once the file has been downloaded.
     * @param {String} [filename] The name of the file to load the model from.
     * @returns {Boolean} Whether the request was issued. (if no filename is
     * specified for the model, or it has already been loaded from the same file,
     * the request will not be issued)
     */
    Model.prototype.requestLoadFromFile = function (filename) {
        // check if there is a new filename given
        if (filename && (filename !== this._filename)) {
            this._filename = filename;
            this.resetReadyState();
        }
        // only issue the request if the model is not already loaded
        if (!this.isReadyToUse()) {
            if (!this._filename) {
                Application.showError(
                        "Attempting to load a model from file, but no filename was specified.",
                        null,
                        this._name ? "Name of the model: " + this._name : "The model has no name either.");
                return false;
            }
            var self = this;
            Application.requestXMLFile("model", this._filename, function (responseXML) {
                self._loadFromXML(responseXML);
                self.setToReady();
            });
            return true;
        }
        return false;
    };

    /**
     * Loads the model data from the passed XML document.
     * @param {Document} xmlDoc
     * @returns {Boolean} Whether the loading has been successful.
     */
    Model.prototype._loadFromXML = function (xmlDoc) {
        var i;
        Application.log("Loading EgomModel from file: " + this._filename + " ...", 2);
        // checking the passed XML document
        if (!(xmlDoc instanceof Document)) {
            Application.showError("'" + this._filename + "' does not appear to be an XML document.",
                    "severe",
                    "A model was supposed to be loaded from this file, but only models of EgomModel format " +
                    "are accepted. Such a file needs to be a valid XML document with an EgomModel root element.");
            return false;
        }
        if (xmlDoc.documentElement.nodeName !== "EgomModel") {
            Application.showError("'" + this._filename + "' does not appear to be an EgomModel file.",
                    "severe",
                    "A model was supposed to be loaded from this file, but only models of EgomModel format " +
                    "are accepted. Such a file needs to have an EgomModel as root element, while this file has " +
                    "'" + xmlDoc.documentElement.nodeName + "' instead.");
            return false;
        }
        // checking EgomModel version
        this._version = xmlDoc.documentElement.getAttribute("version");
        if (!this._version) {
            Application.showError("Model from file: '" + this._filename + "' could not be loaded, because the file version could not have been determined.", "severe");
            return false;
        }
        if (_supportedVersions.indexOf(this._version) < 0) {
            Application.showError("Model from file: '" + this._filename + "' could not be loaded, because the version of the file (" + this._version + ") is not supported.",
                    "severe", "Supported versions are: " + _supportedVersions.join(", ") + ".");
            return false;
        }
        // loading info properties
        this._name = null;
        this._scale = 1;
        this._infoProperties = new Object();
        if (xmlDoc.getElementsByTagName("info").length > 0) {
            var propertyTags = xmlDoc.getElementsByTagName("info")[0].getElementsByTagName("property");
            for (var i = 0; i < propertyTags.length; i++) {
                var propName = propertyTags[i].getAttribute("name");
                switch (propName) {
                    case "name":
                        this._name = propertyTags[i].getAttribute("value");
                        break;
                    case "scale":
                        this._scale = propertyTags[i].getAttribute("value");
                        break;
                    default:
                        this._infoProperties[propName] = propertyTags[i].getAttribute("value");
                }
            }
        }
        if (this._version === "2.0") {
            this._scale = parseFloat(this._infoProperties["size of one unit in mm"]) * 10;
        }
        // setting up some variables for version-specific loading
        var vertexTagName = null;
        var lineTagName = null;
        var triangleTagName = null;
        switch (this._version) {
            case "2.0":
                vertexTagName = "vertex";
                lineTagName = "line";
                triangleTagName = "triangle";
                break;
            case "2.1":
                vertexTagName = "v";
                lineTagName = "l";
                triangleTagName = "t";
                break;
        }
        // loading vertices
        var nVertices = parseInt(xmlDoc.getElementsByTagName("vertices")[0].getAttribute("count"));
        this._vertices = new Array();
        var vertexTags = xmlDoc.getElementsByTagName(vertexTagName);
        this._maxX = 0;
        this._minX = 0;
        this._maxY = 0;
        this._minY = 0;
        this._maxZ = 0;
        this._minZ = 0;
        for (i = 0; i < nVertices; i++) {
            var index = parseInt(vertexTags[i].getAttribute("i"));
            this.setVertex(index, (this._version === "2.1" ?
                    [
                        parseFloat(vertexTags[i].getAttribute("x")),
                        parseFloat(vertexTags[i].getAttribute("y")),
                        parseFloat(vertexTags[i].getAttribute("z"))
                    ]
                    // version 2.0
                    : [
                        parseFloat(vertexTags[i].getAttribute("x")) / 10000,
                        parseFloat(vertexTags[i].getAttribute("y")) / -10000,
                        parseFloat(vertexTags[i].getAttribute("z")) / -10000
                    ]));
        }
        Application.log("Loaded " + nVertices + " vertices.", 3);
        // loading lines
        var nLines = parseInt(xmlDoc.getElementsByTagName("lines")[0].getAttribute("count"));
        this._lines = new Array(nLines);
        var lineTags = xmlDoc.getElementsByTagName(lineTagName);
        for (var i = 0; i < nLines; i++) {
            this._lines[i] = new Line(
                    parseInt(lineTags[i].getAttribute("a")),
                    parseInt(lineTags[i].getAttribute("b")),
                    (this._version === "2.1" ?
                            lineTags[i].getAttribute("color").split(",").map(parseFloat)
                            // version 2.0
                            : [
                                parseInt(lineTags[i].getAttribute("red")) / 255,
                                parseInt(lineTags[i].getAttribute("green")) / 255,
                                parseInt(lineTags[i].getAttribute("blue")) / 255]),
                    (this._version === "2.1" ?
                            parseFloat(lineTags[i].getAttribute("lum"))
                            // version 2.0
                            : parseInt(lineTags[i].getAttribute("luminosity")) / 255),
                    (this._version === "2.1" ?
                            lineTags[i].getAttribute("n").split(",").map(parseFloat)
                            // version 2.0
                            : [
                                parseFloat(lineTags[i].getAttribute("nx")),
                                -parseFloat(lineTags[i].getAttribute("ny")),
                                -parseFloat(lineTags[i].getAttribute("nz"))]));
        }
        Application.log("Loaded " + nLines + " lines.", 3);
        // loading triangles
        var nTriangles = parseInt(xmlDoc.getElementsByTagName("triangles")[0].getAttribute("count"));
        this._triangles = new Array();
        var triangleTags = xmlDoc.getElementsByTagName(triangleTagName);
        var params = {};
        for (var i = 0; i < nTriangles; i++) {
            params.color = this._version === "2.1" ?
                    triangleTags[i].getAttribute("color").split(",").map(parseFloat)
                    // version 2.0
                    : [
                        parseInt(triangleTags[i].getAttribute("red")) / 255,
                        parseInt(triangleTags[i].getAttribute("green")) / 255,
                        parseInt(triangleTags[i].getAttribute("blue")) / 255,
                        (255 - parseInt(triangleTags[i].getAttribute("alpha"))) / 255];
            params.luminosity = this._version === "2.1" ?
                    parseFloat(triangleTags[i].getAttribute("lum"))
                    // version 2.0
                    : parseInt(triangleTags[i].getAttribute("luminosity")) / 255;
            params.shininess = this._version === "2.1" ?
                    parseInt(triangleTags[i].getAttribute("shi"))
                    // version 2.0
                    : parseInt(triangleTags[i].getAttribute("shininess"));
            params.texCoords = this._version === "2.1" ?
                    [
                        triangleTags[i].getAttribute("ta").split(",").map(parseFloat),
                        triangleTags[i].getAttribute("tb").split(",").map(parseFloat),
                        triangleTags[i].getAttribute("tc").split(",").map(parseFloat)
                    ]
                    // version 2.0
                    : [
                        [
                            parseFloat(triangleTags[i].getAttribute("tax")),
                            parseFloat(triangleTags[i].getAttribute("tay"))],
                        [
                            parseFloat(triangleTags[i].getAttribute("tbx")),
                            parseFloat(triangleTags[i].getAttribute("tby"))],
                        [
                            parseFloat(triangleTags[i].getAttribute("tcx")),
                            parseFloat(triangleTags[i].getAttribute("tcy"))]];
            params.normals = this._version === "2.1" ?
                    (triangleTags[i].hasAttribute("n") ?
                            [triangleTags[i].getAttribute("n").split(",").map(parseFloat)] :
                            [
                                triangleTags[i].getAttribute("na").split(",").map(parseFloat),
                                triangleTags[i].getAttribute("nb").split(",").map(parseFloat),
                                triangleTags[i].getAttribute("nc").split(",").map(parseFloat)
                            ])
                    // version 2.0
                    : [
                        [
                            parseFloat(triangleTags[i].getAttribute("nax")),
                            -parseFloat(triangleTags[i].getAttribute("nay")),
                            -parseFloat(triangleTags[i].getAttribute("naz"))],
                        [
                            parseFloat(triangleTags[i].getAttribute("nbx")),
                            -parseFloat(triangleTags[i].getAttribute("nby")),
                            -parseFloat(triangleTags[i].getAttribute("nbz"))],
                        [
                            parseFloat(triangleTags[i].getAttribute("ncx")),
                            -parseFloat(triangleTags[i].getAttribute("ncy")),
                            -parseFloat(triangleTags[i].getAttribute("ncz"))]];
            params.groupIndex = (triangleTags[i].hasAttribute("group") ? triangleTags[i].getAttribute("group") : null);
            params.withoutLines = true;
            this.addTriangle(
                    triangleTags[i].getAttribute("a"),
                    triangleTags[i].getAttribute("b"),
                    triangleTags[i].getAttribute("c"),
                    params);
        }
        Application.log("Loaded " + triangleTags.length + " triangles.", 3);
        Application.log("Model loaded.", 2);
    };

    /**
     * Returns the size of the model, which is calculated as the double of the
     * farthest (X,Y or Z) vertex coordinate to be found in the model.
     * @returns {Number}
     */
    Model.prototype.getSize = function () {
        return this._size;
    };

    /**
     * Returns the greatest positive X vertex coordinate to be found in the model.
     * @returns {Number}
     */
    Model.prototype.getMaxX = function () {
        return this._maxX;
    };

    /**
     * Returns the greatest negative X vertex coordinate to be found in the model.
     * @returns {Number}
     */
    Model.prototype.getMinX = function () {
        return this._minX;
    };

    /**
     * Returns the greatest positive Y vertex coordinate to be found in the model.
     * @returns {Number}
     */
    Model.prototype.getMaxY = function () {
        return this._maxY;
    };

    /**
     * Returns the greatest negative Y vertex coordinate to be found in the model.
     * @returns {Number}
     */
    Model.prototype.getMinY = function () {
        return this._minY;
    };

    /**
     * Returns the greatest positive Z vertex coordinate to be found in the model.
     * @returns {Number}
     */
    Model.prototype.getMaxZ = function () {
        return this._maxZ;
    };

    /**
     * Returns the greatest negative Z vertex coordinate to be found in the model.
     * @returns {Number}
     */
    Model.prototype.getMinZ = function () {
        return this._minZ;
    };

    /**
     * Returns the width of the model, which is calculated as the difference
     * between the smallest and greatest X coordinates found among the vertices.
     * @returns {Number}
     */
    Model.prototype.getWidth = function () {
        return this._maxX - this._minX;
    };

    /**
     * Returns the height of the model, which is calculated as the difference
     * between the smallest and greatest Y coordinates found among the vertices.
     * @returns {Number}
     */
    Model.prototype.getHeight = function () {
        return this._maxY - this._minY;
    };

    /**
     * Returns the depth of the model, which is calculated as the difference
     * between the smallest and greatest Z coordinates found among the vertices.
     * @returns {Number}
     */
    Model.prototype.getDepth = function () {
        return this._maxZ - this._minZ;
    };

    /**
     * Returns the width of the model in meters.
     * @returns {Number}
     */
    Model.prototype.getWidthInMeters = function () {
        return (this._maxX - this._minX) * this._scale;
    };

    /**
     * Returns the height of the model in meters.
     * @returns {Number}
     */
    Model.prototype.getHeightInMeters = function () {
        return (this._maxY - this._minY) * this._scale;
    };

    /**
     * Returns the depth of the model in meters.
     * @returns {Number}
     */
    Model.prototype.getDepthInMeters = function () {
        return (this._maxZ - this._minZ) * this._scale;
    };

    /**
     * Adds this model to the passed ManagedGLContext in the specified drawing
     * mode (wireframe or solid), so that later the vertex buffers of the context
     * can be filled with its data.
     * @param {ManagedGLContext} context The context to which the model should 
     * be added.
     * @param {Boolean} wireframe Whether to add the model for wireframe drawing.
     * Both modes can be added after each other with two calls of this functions.
     */
    Model.prototype.addToContext = function (context, wireframe) {
        // get the already stored properties for easier access
        var props = this._contextProperties[context.getName()];
        // If the model hasn't been added to this context at all yet, add it with
        // the appropriate mode.
        if (!props) {
            props = new ModelContextProperties();
            props.wireframe = wireframe;
            props.solid = !wireframe;
            context.addModel(this);
            // If the model itself was added, check if it has been added with this
            // mode, and if not, the context needs to be reset in order to trigger
            // a new vertex buffer loading next time it is initialized, since new
            // data will need to be loaded to the buffers.
        } else {
            if (!props.wireframe && wireframe) {
                props.wireframe = true;
                context.resetReadyState();
            }
            if (!props.solid && !wireframe) {
                props.solid = true;
                context.resetReadyState();
            }
        }
        // update the stored parameters
        this._contextProperties[context.getName()] = props;
    };

    /**
     * Clears all previous bindings to managed WebGL contexts. After this, the
     * model needs to be added again to contexts if it needs to be rendered in
     * them.
     */
    Model.prototype.clearContextBindings = function () {
        for (var contextName in this._contextProperties) {
            delete this._contextProperties[contextName];
        }
    };

    /**
     * Returns the vertex buffer data for this model, organized in an associative
     * array by the roles of the different data (e.g. position, texCoord)
     * @param {Boolean} wireframe Whether the data for wireframe rendering (lines)
     * needs to be returned.
     * @returns {Object} An associative array, with all the buffer data for this
     * model. (Float32Arrays)
     * The names of the properties correspond to the roles of each of the arrays:
     * position, texCoord, normal, color, luminosity, shininess, groupIndex.
     * The dataSize property contains the number of vertices.
     */
    Model.prototype.getBufferData = function (wireframe) {
        if (wireframe === true) {
            var vertexData = new Float32Array(this._lines.length * 6);
            for (var i = 0; i < this._lines.length; i++) {
                vertexData[i * 6 + 0] = this._vertices[this._lines[i].a].x;
                vertexData[i * 6 + 1] = this._vertices[this._lines[i].a].y;
                vertexData[i * 6 + 2] = this._vertices[this._lines[i].a].z;
                vertexData[i * 6 + 3] = this._vertices[this._lines[i].b].x;
                vertexData[i * 6 + 4] = this._vertices[this._lines[i].b].y;
                vertexData[i * 6 + 5] = this._vertices[this._lines[i].b].z;
            }
            var texCoordData = new Float32Array(this._lines.length * 4);
            for (var i = 0; i < this._lines.length; i++) {
                texCoordData[i * 4 + 0] = 0.0;
                texCoordData[i * 4 + 1] = 1.0;
                texCoordData[i * 4 + 2] = 1.0;
                texCoordData[i * 4 + 3] = 1.0;
            }
            var normalData = new Float32Array(this._lines.length * 6);
            for (var i = 0; i < this._lines.length; i++) {
                normalData[i * 6 + 0] = this._lines[i].normal[0];
                normalData[i * 6 + 1] = this._lines[i].normal[1];
                normalData[i * 6 + 2] = this._lines[i].normal[2];
                normalData[i * 6 + 3] = this._lines[i].normal[0];
                normalData[i * 6 + 4] = this._lines[i].normal[1];
                normalData[i * 6 + 5] = this._lines[i].normal[2];
            }
            var colorData = new Float32Array(this._lines.length * 8);
            for (var i = 0; i < this._lines.length; i++) {
                colorData[i * 8 + 0] = this._lines[i].color[0];
                colorData[i * 8 + 1] = this._lines[i].color[1];
                colorData[i * 8 + 2] = this._lines[i].color[2];
                colorData[i * 8 + 3] = 1.0;
                colorData[i * 8 + 4] = this._lines[i].color[0];
                colorData[i * 8 + 5] = this._lines[i].color[1];
                colorData[i * 8 + 6] = this._lines[i].color[2];
                colorData[i * 8 + 7] = 1.0;
            }
            var luminosityData = new Float32Array(this._lines.length * 2);
            for (var i = 0; i < this._lines.length; i++) {
                luminosityData[i * 2] = this._lines[i].luminosity;
                luminosityData[i * 2 + 1] = this._lines[i].luminosity;
            }
            var shininessData = new Float32Array(this._lines.length * 2);
            for (var i = 0; i < this._lines.length; i++) {
                shininessData[i * 2 + 0] = 0;
                shininessData[i * 2 + 1] = 0;
            }
            var groupIndexData = new Float32Array(this._lines.length * 2);
            for (var i = 0; i < this._lines.length; i++) {
                groupIndexData[i * 2 + 0] = 0;
                groupIndexData[i * 2 + 1] = 0;
            }
        } else {
            var vertexData = new Float32Array(this._triangles.length * 9);
            for (var i = 0; i < this._triangles.length; i++) {
                vertexData[i * 9 + 0] = this._vertices[this._triangles[i].a].x;
                vertexData[i * 9 + 1] = this._vertices[this._triangles[i].a].y;
                vertexData[i * 9 + 2] = this._vertices[this._triangles[i].a].z;
                vertexData[i * 9 + 3] = this._vertices[this._triangles[i].b].x;
                vertexData[i * 9 + 4] = this._vertices[this._triangles[i].b].y;
                vertexData[i * 9 + 5] = this._vertices[this._triangles[i].b].z;
                vertexData[i * 9 + 6] = this._vertices[this._triangles[i].c].x;
                vertexData[i * 9 + 7] = this._vertices[this._triangles[i].c].y;
                vertexData[i * 9 + 8] = this._vertices[this._triangles[i].c].z;
            }
            var texCoordData = new Float32Array(this._triangles.length * 6);
            for (var i = 0; i < this._triangles.length; i++) {
                texCoordData[i * 6 + 0] = this._triangles[i].texCoords[0][0];
                texCoordData[i * 6 + 1] = this._triangles[i].texCoords[0][1];
                texCoordData[i * 6 + 2] = this._triangles[i].texCoords[1][0];
                texCoordData[i * 6 + 3] = this._triangles[i].texCoords[1][1];
                texCoordData[i * 6 + 4] = this._triangles[i].texCoords[2][0];
                texCoordData[i * 6 + 5] = this._triangles[i].texCoords[2][1];
            }
            var normalData = new Float32Array(this._triangles.length * 9);
            for (var i = 0; i < this._triangles.length; i++) {
                normalData[i * 9 + 0] = this._triangles[i].getNormal(0)[0];
                normalData[i * 9 + 1] = this._triangles[i].getNormal(0)[1];
                normalData[i * 9 + 2] = this._triangles[i].getNormal(0)[2];
                normalData[i * 9 + 3] = this._triangles[i].getNormal(1)[0];
                normalData[i * 9 + 4] = this._triangles[i].getNormal(1)[1];
                normalData[i * 9 + 5] = this._triangles[i].getNormal(1)[2];
                normalData[i * 9 + 6] = this._triangles[i].getNormal(2)[0];
                normalData[i * 9 + 7] = this._triangles[i].getNormal(2)[1];
                normalData[i * 9 + 8] = this._triangles[i].getNormal(2)[2];
            }
            var colorData = new Float32Array(this._triangles.length * 12);
            for (var i = 0; i < this._triangles.length; i++) {
                colorData[i * 12 + 0] = this._triangles[i].color[0];
                colorData[i * 12 + 1] = this._triangles[i].color[1];
                colorData[i * 12 + 2] = this._triangles[i].color[2];
                colorData[i * 12 + 3] = this._triangles[i].color[3];
                colorData[i * 12 + 4] = this._triangles[i].color[0];
                colorData[i * 12 + 5] = this._triangles[i].color[1];
                colorData[i * 12 + 6] = this._triangles[i].color[2];
                colorData[i * 12 + 7] = this._triangles[i].color[3];
                colorData[i * 12 + 8] = this._triangles[i].color[0];
                colorData[i * 12 + 9] = this._triangles[i].color[1];
                colorData[i * 12 + 10] = this._triangles[i].color[2];
                colorData[i * 12 + 11] = this._triangles[i].color[3];
            }
            var luminosityData = new Float32Array(this._triangles.length * 3);
            for (var i = 0; i < this._triangles.length; i++) {
                luminosityData[i * 3] = this._triangles[i].luminosity;
                luminosityData[i * 3 + 1] = this._triangles[i].luminosity;
                luminosityData[i * 3 + 2] = this._triangles[i].luminosity;
            }
            var shininessData = new Float32Array(this._triangles.length * 3);
            for (var i = 0; i < this._triangles.length; i++) {
                shininessData[i * 3] = this._triangles[i].shininess;
                shininessData[i * 3 + 1] = this._triangles[i].shininess;
                shininessData[i * 3 + 2] = this._triangles[i].shininess;
            }
            var groupIndexData = new Float32Array(this._triangles.length * 3);
            for (var i = 0; i < this._triangles.length; i++) {
                groupIndexData[i * 3] = this._triangles[i].groupIndex;
                groupIndexData[i * 3 + 1] = this._triangles[i].groupIndex;
                groupIndexData[i * 3 + 2] = this._triangles[i].groupIndex;
            }
        }

        return {
            "position": vertexData,
            "texCoord": texCoordData,
            "normal": normalData,
            "color": colorData,
            "luminosity": luminosityData,
            "shininess": shininessData,
            "groupIndex": groupIndexData,
            "dataSize": (wireframe ? this._lines.length * 2 : this._triangles.length * 3)
        };
    };

    /**
     * Returns the size of the vertex buffer data (number of vertices) that this
     * model has for the specified context.
     * @param {ManagedGLContext} context
     * @returns {Number}
     */
    Model.prototype.getBufferSize = function (context) {
        var props = this._contextProperties[context.getName()];
        return (props.wireframe ? this._lines.length * 2 : 0) + (props.solid ? this._triangles.length * 3 : 0);
    };

    /**
     * Loads the model's vertex data into the vertex buffer objects of the specified
     * context. Data for wireframe and solid rendering is added based on whether
     * the model has been previously added to the context in the respective mode.
     * @param {ManagedGLContext} context
     * @param {Number} startIndex The data will be added starting from this 
     * vertex index within the buffer objects.
     * @returns {Number} The number of vertices for which data has been added.
     */
    Model.prototype.loadToVertexBuffers = function (context, startIndex) {
        var bufferData = null;
        var dataSize = 0;
        var props = this._contextProperties[context.getName()];
        if (props.wireframe) {
            bufferData = this.getBufferData(true);
            props.bufferStartWireframe = startIndex;
            context.setVertexBufferData(bufferData, startIndex);
            dataSize += bufferData.dataSize;
            startIndex += bufferData.dataSize;
        }
        if (props.solid) {
            bufferData = this.getBufferData(false);
            props.bufferStartSolid = startIndex;
            props.bufferStartTransparent = startIndex + this._nOpaqueTriangles * 3;
            context.setVertexBufferData(bufferData, startIndex);
            dataSize += bufferData.dataSize;
            startIndex += bufferData.dataSize;
        }
        return dataSize;
    };

    /**
     * Renders the model within the passed context, with the specified rendering
     * mode (wireframe or solid).
     * @param {ManagedGLContext} context The context into which the model is to
     * be rendered. The model has to be added to this context previously in the
     * same rendering mode, and the context needs to be set up afterwards for
     * rendering.
     * @param {Boolean} wireframe Whether the model should be rendered in 
     * wireframe mode.
     * @param {Boolean} opaque Whether only the opaque parts of the model should be
     * rendered. False means only transparent parts, and undefined (omitted) means
     * the whole model. Only effective in solid rendering mode.
     */
    Model.prototype.render = function (context, wireframe, opaque) {
        var props = this._contextProperties[context.getName()];
        if (wireframe === true) {
            context.gl.drawArrays(context.gl.LINES, props.bufferStartWireframe, 2 * this._lines.length);
        } else {
            switch (opaque) {
                case true:
                    context.gl.drawArrays(context.gl.TRIANGLES, props.bufferStartSolid, 3 * this._nOpaqueTriangles);
                    break;
                case false:
                    context.gl.drawArrays(context.gl.TRIANGLES, props.bufferStartTransparent, 3 * this._nTransparentTriangles);
                    break;
                case undefined:
                    context.gl.drawArrays(context.gl.TRIANGLES, props.bufferStartSolid, 3 * this._triangles.length);
                    break;
            }
        }
    };

    /**
     * Adds a cuboid geometry to the object. (both vertices and faces)
     * @param {Number} x The X coordinate of the center of the cuboid.
     * @param {Number} y The Y coordinate of the center of the cuboid.
     * @param {Number} z The Z coordinate of the center of the cuboid.
     * @param {Number} width The width (X dimension) of the cuboid.
     * @param {Number} height The height (Y dimension) of the cuboid.
     * @param {Number} depth The depth (Z dimension) of the cuboid.
     * @param {Number[4]} color The color of the faces of the cuboid 
     * ([red,green,blue,alpha])
     * @param {Number} luminosity The luminosity factor of the cuboid faces of 
     * the cuboid (0.0-1.0)
     * @param {Number[4][2]} textureCoordinates The texture coordinates for the 
     * faces of the cuboid (the two coordinates for each of the 4 vertices of one
     * face.
     * @param {Boolean} cullFace Whether the faces facing the inside of the cuboid
     * should be culled (omitted)
     */
    Model.prototype.addCuboid = function (x, y, z, width, height, depth, color, luminosity, textureCoordinates, cullFace) {
        var i0 = +this._vertices.length;

        // front
        this.appendVertex([x - width / 2, y - height / 2, z + depth / 2]);
        this.appendVertex([x + width / 2, y - height / 2, z + depth / 2]);
        this.appendVertex([x + width / 2, y + height / 2, z + depth / 2]);
        this.appendVertex([x - width / 2, y + height / 2, z + depth / 2]);
        // back
        this.appendVertex([x - width / 2, y + height / 2, z - depth / 2]);
        this.appendVertex([x + width / 2, y + height / 2, z - depth / 2]);
        this.appendVertex([x + width / 2, y - height / 2, z - depth / 2]);
        this.appendVertex([x - width / 2, y - height / 2, z - depth / 2]);
        // top
        this.appendVertex([x + width / 2, y + height / 2, z - depth / 2]);
        this.appendVertex([x - width / 2, y + height / 2, z - depth / 2]);
        this.appendVertex([x - width / 2, y + height / 2, z + depth / 2]);
        this.appendVertex([x + width / 2, y + height / 2, z + depth / 2]);
        // bottom
        this.appendVertex([x - width / 2, y - height / 2, z - depth / 2]);
        this.appendVertex([x + width / 2, y - height / 2, z - depth / 2]);
        this.appendVertex([x + width / 2, y - height / 2, z + depth / 2]);
        this.appendVertex([x - width / 2, y - height / 2, z + depth / 2]);
        // right
        this.appendVertex([x + width / 2, y - height / 2, z - depth / 2]);
        this.appendVertex([x + width / 2, y + height / 2, z - depth / 2]);
        this.appendVertex([x + width / 2, y + height / 2, z + depth / 2]);
        this.appendVertex([x + width / 2, y - height / 2, z + depth / 2]);
        // left
        this.appendVertex([x - width / 2, y + height / 2, z - depth / 2]);
        this.appendVertex([x - width / 2, y - height / 2, z - depth / 2]);
        this.appendVertex([x - width / 2, y - height / 2, z + depth / 2]);
        this.appendVertex([x - width / 2, y + height / 2, z + depth / 2]);

        var normals = [[0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]];
        var params = {
            color: color,
            luminosity: luminosity,
            texCoords: textureCoordinates
        };

        for (var i = 0; i < 6; i++) {
            params.normals = [normals[i]];
            this.addQuad(i0 + (i * 4) + 0, i0 + (i * 4) + 1, i0 + (i * 4) + 2, i0 + (i * 4) + 3, params);
            if (!cullFace) {
                params.normals = [Vec.scaled3(normals[i], -1)];
                this.addQuad(i0 + (i * 4) + 2, i0 + (i * 4) + 1, i0 + (i * 4) + 0, i0 + (i * 4) + 3, params);
            }
        }

    };

    /**
     * Returns 2D coordinates of a point within a specified rectangular area 
     * based on the relative position of the point within that rectangle.
     * @param {Number} left The X coordinate of the left edge of the rectangle.
     * @param {Number} bottom The Y coordinate of the bottom edge of the rectangle.
     * @param {Number} right The X coordinate of the right edge of the rectangle.
     * @param {Number} top The Y coordinate of the top edge of the rectangle.
     * @param {Number} relativeX The relative X coordinate of the point within
     * the rectangle (0.0-1.0)
     * @param {Number} relativeY The relative Y coordinate of the point within
     * the rectangle (0.0-1.0)
     * @returns {Number[2]}
     */
    function uvCoordsOnTexture(left, bottom, right, top, relativeX, relativeY) {
        var result = [0, 0];
        result[0] = left + (right - left) * relativeX;
        result[1] = bottom + (top - bottom) * relativeY;
        return result;
    }

    /**
     * Adds vertices and triangles that form a sphere (UV sphere).
     * @param {Number} x The X coordinate of the center.
     * @param {Number} y The Y coordinate of the center.
     * @param {Number} z The Z coordinate of the center.
     * @param {Number} radius The radius of the sphere.
     * @param {Number} angles The number of angles one circle should have within 
     * the sphere.
     * @param {Number[4]} color The RGBA components of the desired color of the 
     * triangles.
     * @param {Number} luminosity The luminosity of the triangles.
     * @param {Number} shininess The shininess exponent of the triangles.
     * @param {Number[4][2]} textureCoordinates The coordinate pairs of the 
     * texture to map to the sphere: from bottom left counter-clockwise
     * @param {Boolean} cullFace Whether to omit the triangles from the inside 
     * of the sphere.
     */
    Model.prototype.addSphere = function (x, y, z, radius, angles, color, luminosity, shininess, textureCoordinates, cullFace) {
        // circles with vertices indexed starting from the top, starting from XY and spinned around axis Y
        for (var i = 0; i < angles; i++) {
            for (var j = 0; j < angles; j++) {
                this.appendVertex([x + radius * Math.sin(j * 2 * 3.1415 / angles) * Math.cos(i * 2 * 3.1415 / angles), y + radius * Math.cos(j * 2 * 3.1415 / angles), z + radius * Math.sin(i * 2 * 3.1415 / angles) * Math.sin(j * 2 * 3.1415 / angles)]);
            }
        }

        var i0 = this._vertices.length - angles * angles;

        if ((angles % 2) === 1) {
            this._vertices[i0 + (angles + 1) / 2].setX(x);
            this._vertices[i0 + (angles + 1) / 2].setZ(z);
        }

        for (var i = 0; i < angles; i++) {
            // adding triangles connected to the top
            // the vertex indices:
            var v = [i0 + (i * angles), i0 + (((i + 1) % angles) * angles) + 1, i0 + (i * angles) + 1];
            // the UV texture coordinates:
            var uv1 = uvCoordsOnTexture(textureCoordinates[0][0], textureCoordinates[0][1], textureCoordinates[2][0], textureCoordinates[2][1], 1 / (2 * angles) + (i / angles), 1);
            var uv2 = uvCoordsOnTexture(textureCoordinates[0][0], textureCoordinates[0][1], textureCoordinates[2][0], textureCoordinates[2][1], (i + 1) / angles, 1 - 2 / angles);
            var uv3 = uvCoordsOnTexture(textureCoordinates[0][0], textureCoordinates[0][1], textureCoordinates[2][0], textureCoordinates[2][1], i / angles, 1 - 2 / angles);
            // the normal vectors:
            var n1 = [(this._vertices[v[0]].x - x) / radius, (this._vertices[v[0]].y - y) / radius, (this._vertices[v[0]].z - z) / radius];
            var n2 = [(this._vertices[v[1]].x - x) / radius, (this._vertices[v[1]].y - y) / radius, (this._vertices[v[1]].z - z) / radius];
            var n3 = [(this._vertices[v[2]].x - x) / radius, (this._vertices[v[2]].y - y) / radius, (this._vertices[v[2]].z - z) / radius];
            this.addTriangle(v[0], v[1], v[2], {color: color, luminosity: luminosity, shininess: shininess,
                texCoords: [uv1, uv2, uv3],
                normals: [n1, n2, n3]});
            if (cullFace !== true) {
                this.addTriangle(v[0], v[2], v[1], {color: color, luminosity: luminosity, shininess: shininess,
                    texCoords: [uv1, uv3, uv2],
                    normals: [Vec.scaled3(n1, -1), Vec.scaled3(n3, -1), Vec.scaled3(n2, -1)]});
            }
            // triangles connected to the bottom
            if ((angles % 2) === 0) {
                v = [i0 + (i * angles) + angles / 2, i0 + (i * angles) + angles / 2 - 1, i0 + (((i + 1) % angles) * angles) + angles / 2 - 1];
            } else {
                v = [i0 + (angles + 1) / 2, i0 + (i * angles) + (angles - 1) / 2, i0 + (((i + 1) % angles) * angles) + (angles - 1) / 2];
            }
            uv1 = uvCoordsOnTexture(textureCoordinates[0][0], textureCoordinates[0][1], textureCoordinates[2][0], textureCoordinates[2][1], 1 / (2 * angles) + (i / angles), 0);
            uv2 = uvCoordsOnTexture(textureCoordinates[0][0], textureCoordinates[0][1], textureCoordinates[2][0], textureCoordinates[2][1], i / angles, ((angles % 2) === 0) ? 2 / angles : 1 / angles);
            uv3 = uvCoordsOnTexture(textureCoordinates[0][0], textureCoordinates[0][1], textureCoordinates[2][0], textureCoordinates[2][1], (i + 1) / angles, ((angles % 2) === 0) ? 2 / angles : 1 / angles);
            n1 = [(this._vertices[v[0]].x - x) / radius, (this._vertices[v[0]].y - y) / radius, (this._vertices[v[0]].z - z) / radius];
            n2 = [(this._vertices[v[1]].x - x) / radius, (this._vertices[v[1]].y - y) / radius, (this._vertices[v[1]].z - z) / radius];
            n3 = [(this._vertices[v[2]].x - x) / radius, (this._vertices[v[2]].y - y) / radius, (this._vertices[v[2]].z - z) / radius];
            this.addTriangle(v[0], v[1], v[2], {color: color, luminosity: luminosity, shininess: shininess,
                texCoords: [uv1, uv2, uv3],
                normals: [n1, n2, n3]});
            if (cullFace !== true) {
                this.addTriangle(v[0], v[2], v[1], {color: color, luminosity: luminosity, shininess: shininess,
                    texCoords: [uv1, uv3, uv2],
                    normals: [Vec.scaled3(n1, -1), Vec.scaled3(n3, -1), Vec.scaled3(n2, -1)]});
            }
            // quads between the two subsequent circles
            for (var j = 1; j < angles / 2 - 1; j++) {
                v = [i0 + (i * angles) + j, i0 + (((i + 1) % angles) * angles) + j + 1, i0 + (i * angles) + j + 1];
                uv1 = uvCoordsOnTexture(textureCoordinates[0][0], textureCoordinates[0][1], textureCoordinates[2][0], textureCoordinates[2][1], i / angles, 1 - 2 * j / angles);
                uv2 = uvCoordsOnTexture(textureCoordinates[0][0], textureCoordinates[0][1], textureCoordinates[2][0], textureCoordinates[2][1], (i + 1) / angles, 1 - 2 * (j + 1) / angles);
                uv3 = uvCoordsOnTexture(textureCoordinates[0][0], textureCoordinates[0][1], textureCoordinates[2][0], textureCoordinates[2][1], i / angles, 1 - 2 * (j + 1) / angles);
                n1 = [(this._vertices[v[0]].x - x) / radius, (this._vertices[v[0]].y - y) / radius, (this._vertices[v[0]].z - z) / radius];
                n2 = [(this._vertices[v[1]].x - x) / radius, (this._vertices[v[1]].y - y) / radius, (this._vertices[v[1]].z - z) / radius];
                n3 = [(this._vertices[v[2]].x - x) / radius, (this._vertices[v[2]].y - y) / radius, (this._vertices[v[2]].z - z) / radius];
                this.addTriangle(v[0], v[1], v[2], {color: color, luminosity: luminosity, shininess: shininess,
                    texCoords: [uv1, uv2, uv3],
                    normals: [n1, n2, n3]});
                if (cullFace !== true) {
                    this.addTriangle(v[0], v[2], v[1], {color: color, luminosity: luminosity, shininess: shininess,
                        texCoords: [uv1, uv3, uv2],
                        normals: [Vec.scaled3(n1, -1), Vec.scaled3(n3, -1), Vec.scaled3(n2, -1)]});
                }
                v = [i0 + (((i + 1) % angles) * angles) + j + 1, i0 + (i * angles) + j, i0 + (((i + 1) % angles) * angles) + j];
                uv1 = uvCoordsOnTexture(textureCoordinates[0][0], textureCoordinates[0][1], textureCoordinates[2][0], textureCoordinates[2][1], (i + 1) / angles, 1 - 2 * (j + 1) / angles);
                uv2 = uvCoordsOnTexture(textureCoordinates[0][0], textureCoordinates[0][1], textureCoordinates[2][0], textureCoordinates[2][1], i / angles, 1 - 2 * j / angles);
                uv3 = uvCoordsOnTexture(textureCoordinates[0][0], textureCoordinates[0][1], textureCoordinates[2][0], textureCoordinates[2][1], (i + 1) / angles, 1 - 2 * j / angles);
                n1 = [(this._vertices[v[0]].x - x) / radius, (this._vertices[v[0]].y - y) / radius, (this._vertices[v[0]].z - z) / radius];
                n2 = [(this._vertices[v[1]].x - x) / radius, (this._vertices[v[1]].y - y) / radius, (this._vertices[v[1]].z - z) / radius];
                n3 = [(this._vertices[v[2]].x - x) / radius, (this._vertices[v[2]].y - y) / radius, (this._vertices[v[2]].z - z) / radius];
                this.addTriangle(v[0], v[1], v[2], {color: color, luminosity: luminosity, shininess: shininess,
                    texCoords: [uv1, uv2, uv3],
                    normals: [n1, n2, n3]});
                if (cullFace !== true) {
                    this.addTriangle(v[0], v[2], v[1], {color: color, luminosity: luminosity, shininess: shininess,
                        texCoords: [uv1, uv3, uv2],
                        normals: [Vec.scaled3(n1, -1), Vec.scaled3(n3, -1), Vec.scaled3(n2, -1)]});
                }
            }
        }
    };

    // Public methods exposed outside of this library
    return {
        Model: Model,
        /**
         * Sets up and returns a simple model that is suitable to be used for
         * rendering Full Viewport Quads. (FVQ)
         * @param {String} [name] The name of the model to be created.
         * @returns {Model}
         */
        fvqModel: function (name) {
            var result = new Model();
            name && result.setName(name);

            result.appendVertex([-1, -1, 0]);
            result.appendVertex([1, -1, 0]);
            result.appendVertex([1, 1, 0]);
            result.appendVertex([-1, 1, 0]);

            result.addQuad(0, 1, 2, 3);

            return result;
        },
        /**
         * Sets up and returns a simple model that contains a two sided XY square.
         * @param {String} [name] The name of the model to be created.
         * @returns {Model}
         */
        squareModel: function (name) {
            var result = new Model();
            name && result.setName(name);

            result.appendVertex([-1, -1, 0]);
            result.appendVertex([1, -1, 0]);
            result.appendVertex([1, 1, 0]);
            result.appendVertex([-1, 1, 0]);

            result.addQuad(0, 1, 2, 3);
            result.addQuad(2, 1, 0, 3, {texCoords: [[0, 1], [1, 1], [1, 0], [0, 0]]});

            return result;
        },
        /**
         * Sets up and returns a simple model that is suitable for rendering
         * billboards that turn around one axis to face the camera. The model
         * contains one square to serve as the turning side view (with texture
         * coordinates corresponding to the upper half of the texture) and a set 
         * of intersecting squares that are perpendicular to the first one
         * (with texture coordinates corresponding to the lower half of the 
         * texture), to serve as the front/back view(s) so that the billboard 
         * does not look flat at sharp angles.
         * @param {String} [name] The name of the model to be created.
         * @param {Number[]} [intersections] A set of numbers between -1 and 1
         * representing the points where the squares serving as the front view 
         * should be created along the side view square.
         * @returns {Model}
         */
        turningBillboardModel: function (name, intersections) {
            var result = new Model();
            name && result.setName(name);

            result.appendVertex([-1, -1, 0]);
            result.appendVertex([1, -1, 0]);
            result.appendVertex([1, 1, 0]);
            result.appendVertex([-1, 1, 0]);

            result.addQuad(0, 1, 2, 3, {texCoords: [[0.0, 0.5], [1.0, 0.5], [1.0, 0.0], [0.0, 0.0]]});

            if (intersections) {
                for (var i = 0; i < intersections.length; i++) {
                    result.appendVertex([1, intersections[i], -1]);
                    result.appendVertex([-1, intersections[i], -1]);
                    result.appendVertex([-1, intersections[i], 1]);
                    result.appendVertex([1, intersections[i], 1]);

                    result.addQuad(((i + 1) * 4) + 0, ((i + 1) * 4) + 1, ((i + 1) * 4) + 2, ((i + 1) * 4) + 3, {texCoords: [[0.0, 1.0], [1.0, 1.0], [1.0, 0.5], [0.0, 0.5]]});
                    result.addQuad(((i + 1) * 4) + 3, ((i + 1) * 4) + 2, ((i + 1) * 4) + 1, ((i + 1) * 4) + 0, {texCoords: [[0.0, 1.0], [1.0, 1.0], [1.0, 0.5], [0.0, 0.5]]});
                }
            }

            return result;
        },
        /**
         * Sets up and returns a simple model that contains a cuboid (XYZ-box)  
         * with the given properties.
         * @param {String} [name] The name of the model to be created.
         * @param {Number} width Size of the box along the X axis.
         * @param {Number} height Size of the box along the Y axis.
         * @param {Number} depth Size of the box along the Z axis.
         * @param {Number[4]} color A vector containing the RGBA components of the 
         * desired box color.
         * @returns {Model}
         */
        cuboidModel: function (name, width, height, depth, color) {
            var result = new Model();
            name && result.setName(name);
            result.addCuboid(0, 0, 0, width, height, depth, color, 128, [[0, 1], [1, 1], [1, 0], [0, 0]], false);
            return result;
        },
        /**
         * Sets up and returns a simple model that contains a two vertices, the
         * first of which is in the origo, connected by a line.
         * @param {String} [name] The name of the model to be created.
         * @param {Number[3]} vector The vector pointing from the origo towards 
         * the second vertex.
         * @param {Number[4]} color The RGB components of the color to use for 
         * the line.
         * @returns {Model}
         */
        lineModel: function (name,vector,color) {
            var result = new Model();
            name && result.setName(name);
            result.appendVertex([0.0, 0.0, 0.0]);
            result.appendVertex(vector);
            result._lines.push(new Line(0, 1, color, 1, vector));
            return result;
        }
    };
})();