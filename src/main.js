window.onload = function () {
    // canvasへの参照を取得
    var c = document.getElementById("canvas");

    // canvasサイズを変更
    c.width = 512;
    c.height = 512;

    // webGLコンテキストの取得
    var gl = c.getContext("webgl");
    if (!gl) {
        alert("webgl not supported");
        return;
    }

    // canvasエレメントをクリア
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    // シェーダー
    var vertexSource = document.getElementById("vs").textContent;
    var fragmentSource = document.getElementById("fs").textContent;
    var programs = shaderProgram(vertexSource, fragmentSource);

    // uniform Locationを取得
    var uniLocation = {}
    uniLocation.mvpMatrix = gl.getUniformLocation(programs, 'mvpMatrix');
    uniLocation.invMatrix = gl.getUniformLocation(programs, 'invMatrix');
    uniLocation.lightDirection = gl.getUniformLocation(programs, 'lightDirection');
    uniLocation.eyePosition = gl.getUniformLocation(programs, 'eyePosition');
    uniLocation.centerPoint = gl.getUniformLocation(programs, 'centerPoint');
    uniLocation.ambientColor = gl.getUniformLocation(programs, 'ambientColor');

    // 球体を形成する頂点データを取得
    var sphereData = sphere(64, 64, 1.0);

    // 頂点データから頂点バッファを生成
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.p), gl.STATIC_DRAW);
    var attLocPosition = gl.getAttribLocation(programs, "position");
    gl.enableVertexAttribArray(attLocPosition);
    gl.vertexAttribPointer(attLocPosition, 3, gl.FLOAT, false, 0, 0);

    // 頂点データからインデックスバッファを生成
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(sphereData.i), gl.STATIC_DRAW);

    // 頂点データから頂点色バッファを生成
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.c), gl.STATIC_DRAW);
    var attLocColor = gl.getAttribLocation(programs, "color");
    gl.enableVertexAttribArray(attLocColor);
    gl.vertexAttribPointer(attLocColor, 4, gl.FLOAT, false, 0, 0);

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.n), gl.STATIC_DRAW);
    var attLocNormal = gl.getAttribLocation(programs, "normal");
    gl.enableVertexAttribArray(attLocNormal);
    gl.vertexAttribPointer(attLocNormal, 3, gl.FLOAT, false, 0, 0);

    var mat = new matIV();
    var mMatrix = mat.identity(mat.create());
    var vMatrix = mat.identity(mat.create());
    var pMatrix = mat.identity(mat.create());
    var vpMatrix = mat.identity(mat.create());
    var mvpMatrix = mat.identity(mat.create());
    var invMatrix = mat.identity(mat.create());

    // ビュー座標変換
    var cameraPosition = [0.0, 0.0, 3.0];  // カメラの位置
    var cameraPoint = [0.0, 0.0, 0.0]; // カメラの注視点
    var cameraUp = [0.0, 1.0, 0.0]; // カメラの上方向
    mat.lookAt(cameraPosition, cameraPoint, cameraUp, vMatrix);

    // プロジェクション座標変換
    var fovy = 45.0; // 視野角
    var aspect = c.width / c.height; // アスペクト比
    var near = 0.1; // 最前面
    var far = 10.0; // 奥行き終端
    mat.perspective(fovy, aspect, near, far, pMatrix);

    // MVPマトリックス
    mat.multiply(pMatrix, vMatrix, vpMatrix);
    var count = 0;

    // 平行光源の向き
    var lightDirection = [1.0, 1.0, 1.0];

    // 環境光の色
    var ambientColor = [0.5, 0.0, 0.0, 1.0];

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    render();

    function render() {
        count++;
        var radians = (count % 360) * Math.PI / 180;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat.identity(mMatrix);
        var axis = [0.0, 1.0, 1.0];
        mat.rotate(mMatrix, radians, axis, mMatrix);
        mat.multiply(vpMatrix, mMatrix, mvpMatrix);

        mat.inverse(mMatrix, invMatrix);

        gl.uniformMatrix4fv(uniLocation.mvpMatrix, false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocation.invMatrix, false, invMatrix);
        gl.uniform3fv(uniLocation.lightDirection, lightDirection);
        gl.uniform3fv(uniLocation.eyePosition, cameraPosition);
        gl.uniform3fv(uniLocation.centerPoint, cameraPoint);
        gl.uniform4fv(uniLocation.ambientColor, ambientColor);

        // 描画
        gl.drawElements(gl.TRIANGLES, sphereData.i.length, gl.UNSIGNED_SHORT, 0);
        gl.flush();

        requestAnimationFrame(render);
    }

    function shaderProgram(vertexSource, fragmentSource) {
        // シェーダーオブジェクトの生成
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        // シェーダーオブジェクトにソースを割り当ててコンパイル
        gl.shaderSource(vertexShader, vertexSource);
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(vertexShader));
        }
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(fragmentShader));
        }

        // プログラムオブジェクトを生成
        var programs = gl.createProgram();
        gl.attachShader(programs, vertexShader);
        gl.attachShader(programs, fragmentShader);
        gl.linkProgram(programs);
        if (gl.getProgramParameter(programs, gl.LINK_STATUS)) {
            gl.useProgram(programs);
        }
        else {
            alert(gl.getProgramInfoLog(programs));
        }
        return programs;
    }
};
