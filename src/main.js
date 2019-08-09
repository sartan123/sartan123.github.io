window.onload = function () {
    // canvas�ւ̎Q�Ƃ��擾
    var c = document.getElementById("canvas");

    // canvas�T�C�Y��ύX
    c.width = 512;
    c.height = 512;

    // webGL�R���e�L�X�g�̎擾
    var gl = c.getContext("webgl");
    if (!gl) {
        alert("webgl not supported");
        return;
    }

    // canvas�G�������g���N���A
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    // �V�F�[�_�[
    var vertexSource = document.getElementById("vs").textContent;
    var fragmentSource = document.getElementById("fs").textContent;
    var programs = shaderProgram(vertexSource, fragmentSource);

    // uniform Location���擾
    var uniLocation = {}
    uniLocation.mvpMatrix = gl.getUniformLocation(programs, 'mvpMatrix');
    uniLocation.invMatrix = gl.getUniformLocation(programs, 'invMatrix');
    uniLocation.lightDirection = gl.getUniformLocation(programs, 'lightDirection');
    uniLocation.eyePosition = gl.getUniformLocation(programs, 'eyePosition');
    uniLocation.centerPoint = gl.getUniformLocation(programs, 'centerPoint');
    uniLocation.ambientColor = gl.getUniformLocation(programs, 'ambientColor');

    // ���̂��`�����钸�_�f�[�^���擾
    var sphereData = sphere(64, 64, 1.0);

    // ���_�f�[�^���璸�_�o�b�t�@�𐶐�
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.p), gl.STATIC_DRAW);
    var attLocPosition = gl.getAttribLocation(programs, "position");
    gl.enableVertexAttribArray(attLocPosition);
    gl.vertexAttribPointer(attLocPosition, 3, gl.FLOAT, false, 0, 0);

    // ���_�f�[�^����C���f�b�N�X�o�b�t�@�𐶐�
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(sphereData.i), gl.STATIC_DRAW);

    // ���_�f�[�^���璸�_�F�o�b�t�@�𐶐�
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

    // �r���[���W�ϊ�
    var cameraPosition = [0.0, 0.0, 3.0];  // �J�����̈ʒu
    var cameraPoint = [0.0, 0.0, 0.0]; // �J�����̒����_
    var cameraUp = [0.0, 1.0, 0.0]; // �J�����̏����
    mat.lookAt(cameraPosition, cameraPoint, cameraUp, vMatrix);

    // �v���W�F�N�V�������W�ϊ�
    var fovy = 45.0; // ����p
    var aspect = c.width / c.height; // �A�X�y�N�g��
    var near = 0.1; // �őO��
    var far = 10.0; // ���s���I�[
    mat.perspective(fovy, aspect, near, far, pMatrix);

    // MVP�}�g���b�N�X
    mat.multiply(pMatrix, vMatrix, vpMatrix);
    var count = 0;

    // ���s�����̌���
    var lightDirection = [1.0, 1.0, 1.0];

    // �����̐F
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

        // �`��
        gl.drawElements(gl.TRIANGLES, sphereData.i.length, gl.UNSIGNED_SHORT, 0);
        gl.flush();

        requestAnimationFrame(render);
    }

    function shaderProgram(vertexSource, fragmentSource) {
        // �V�F�[�_�[�I�u�W�F�N�g�̐���
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        // �V�F�[�_�[�I�u�W�F�N�g�Ƀ\�[�X�����蓖�ĂăR���p�C��
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

        // �v���O�����I�u�W�F�N�g�𐶐�
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
