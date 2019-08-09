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

    var model = sphere(64, 64, 1.0, [1.0, 1.0, 1.0, 1.0]);
    //var model = square();

    var textureCoord = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ];

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.p), gl.STATIC_DRAW);

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.c), gl.STATIC_DRAW);

    var textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.t), gl.STATIC_DRAW);

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

    var attTextureLocation = gl.getAttribLocation(programs, 'textureCoord');
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.enableVertexAttribArray(attTextureLocation);
    gl.vertexAttribPointer(attTextureLocation, 2, gl.FLOAT, false, 0, 0);

    var uniMVPLocation = gl.getUniformLocation(programs, "mvpMatrix");
    var unitexLocation = gl.getUniformLocation(programs, "texture");

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.activeTexture(gl.TEXTURE0);
    var texture = null;
    create_texture('texture0.png');

    var count = 0;

    loadCheck();

    function loadCheck(){
        if(texture != null){
            render();
            return;
        }
        setTimeout(loadCheck, 100);
    }

    function render(){
        count++;
        var radians = (count % 360) * Math.PI / 180;
        
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat.identity(mMatrix);
        mat.rotate(mMatrix, radians, [0, 1, 0], mMatrix);
        mat.multiply(pMatrix, vMatrix, vpMatrix);
        mat.multiply(vpMatrix, mMatrix, mvpMatrix);

        mat.inverse(mMatrix, invMatrix);
        
        gl.uniformMatrix4fv(uniMVPLocation, false, mvpMatrix);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(unitexLocation, 0);

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

    function create_texture(source){
        var img = new Image();
        
        img.onload = function(){
            var tex = gl.createTexture();
            
            gl.bindTexture(gl.TEXTURE_2D, tex);
            
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            
            gl.generateMipmap(gl.TEXTURE_2D);
            
            gl.bindTexture(gl.TEXTURE_2D, null);
            
            texture = tex;
        };
        
        img.src = source;
    }
}
