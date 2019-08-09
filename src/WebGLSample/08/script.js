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
    var vMatrix = mat.identity(mat.create());
    var pMatrix = mat.identity(mat.create());

    var cameraPosition = [0.0, 0.0, 0.0];
    var cameraPoint = [1.0, 0.0, 1.0];
    var cameraUp = [0.0, 1.0, 0.0];
    mat.lookAt(cameraPosition, cameraPoint, cameraUp, vMatrix);

    mat.identity(pMatrix);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //var model = sphere(64, 64, 1.0);
    var model = square();

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.p), gl.STATIC_DRAW);

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.c), gl.STATIC_DRAW);

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.n), gl.STATIC_DRAW);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,  indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(model.i), gl.STATIC_DRAW);

    var vertexSource = document.getElementById("vs").textContent;
    var fragmentSource = document.getElementById("fs").textContent;
    var programs = getProgram(vertexSource, fragmentSource);
 
    var attLocation = gl.getAttribLocation(programs, "position");
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(attLocation);
    gl.vertexAttribPointer(attLocation, 3, gl.FLOAT, false, 0, 0);

    var attColorLocation = gl.getAttribLocation(programs, "color");
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(attColorLocation);
    gl.vertexAttribPointer(attColorLocation, 4, gl.FLOAT, false, 0, 0);

    var attNormalLocation = gl.getAttribLocation(programs, "normal");
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.enableVertexAttribArray(attNormalLocation);
    gl.vertexAttribPointer(attNormalLocation, 3, gl.FLOAT, false, 0, 0);

    var uniViewLocation = gl.getUniformLocation(programs, "vMatrix");
    var uniProjLocation = gl.getUniformLocation(programs, "pMatrix");
    var uniResolution = gl.getUniformLocation(programs, "resolution");
    var uniRayPosition = gl.getUniformLocation(programs, "rayPosition");
    gl.uniformMatrix4fv(uniProjLocation, false, pMatrix);
    gl.uniform2fv(uniResolution, [c.width, c.height]);

    var count = 0;

    render();

    function render(){
        count++;
        var radians = (count % 360) * Math.PI / 180;
        
        gl.clearColor(0.2, 0.5, 0.7, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        mat.lookAt(cameraPosition, [Math.sin(radians), 0.0, -Math.cos(radians)], cameraUp, vMatrix);
        
        gl.uniformMatrix4fv(uniViewLocation, false, vMatrix);
        gl.uniform3fv(uniRayPosition, [Math.sin(radians) * 5.0, 2.0, Math.cos(radians) * 5.0]);

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
}
