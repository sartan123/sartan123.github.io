window.onload = function(){
    var c = document.getElementById("canvas");
    c.width = 512;
    c.height = 512;

    var gl = c.getContext("webgl");

    if(!gl){
        alert("webgl not supported");
        return;
    }

    var mat = new matIV();
    var mMatrix = mat.identity(mat.create());
    var vMatrix = mat.identity(mat.create());
    var pMatrix = mat.identity(mat.create());
    var vpMatrix = mat.identity(mat.create());
    var mvpMatrix = mat.identity(mat.create());
    var invMatrix = mat.identity(mat.create());

    var cameraPosition = [0.0, 0.0, 4.0];
    var cameraPoint = [0.0, 0.0, 0.0];
    var cameraUp = [0.0, 1.0, 0.0];
    mat.lookAt(cameraPosition, cameraPoint, cameraUp, vMatrix);

    var fovy = 45.0;
    var aspect = c.width / c.height;
    var near = 0.1;
    var far = 100.0;
    mat.perspective(fovy, aspect, near, far, pMatrix);

    mat.multiply(pMatrix, vMatrix, vpMatrix);
    mat.multiply(vpMatrix, mMatrix, mvpMatrix);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var vertexSource = document.getElementById("vs").textContent;
    var fragmentSource = document.getElementById("fs").textContent;
    var programs = getProgram(vertexSource, fragmentSource);

    //var model = sphere(64, 64, 1.0, [0.5, 0.5, 0.5, 1.0]);
    var model = square();

    var vertexBuffer = create_vbo(model.p);
    var colorBuffer = create_vbo(model.c);
    var normalBuffer = create_vbo(model.n);
    vboList = [vertexBuffer, colorBuffer, normalBuffer];

    var ibo = create_ibo(model.i);
 
    var attL = new Array();
    attL[0] = gl.getAttribLocation(programs, "position");
    attL[1] = gl.getAttribLocation(programs, "color");
    attL[2] = gl.getAttribLocation(programs, "normal");

    var attS = new Array();
    attS[0] = 3;
    attS[1] = 4;
    attS[2] = 3;

    set_attribute(vboList, attL, attS);

    var uniResolutionLocation = gl.getUniformLocation(programs, "Resolution");

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    render();

    function render(){
       
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniform2fv(uniResolutionLocation, [c.width, c.height]);

        gl.drawElements(gl.TRIANGLES, model.i.length, gl.UNSIGNED_SHORT, 0);
        gl.flush();

        requestAnimationFrame(render);
    }

    function getProgram(vertexSource, fragmentSource){
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        var programs = gl.createProgram();
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);
        if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
            alert(gl.getShaderInfoLog(vertexShader));
        }
        gl.attachShader(programs, vertexShader);
    
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);
        if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
            alert(gl.getShaderInfoLog(fragmentShader));
        }
        gl.attachShader(programs, fragmentShader);
    
        gl.linkProgram(programs);
        gl.useProgram(programs);

        return programs;
    }

    function create_vbo(data){
        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vbo;
    }

    function create_ibo(data){
        var ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,  ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        return ibo;
    }

    function set_attribute(vbo, attL, attS){
		for(var i in vbo){
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
			gl.enableVertexAttribArray(attL[i]);
			gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
		}
    }
}