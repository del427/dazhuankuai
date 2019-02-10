(function () {
  //canvas画板
  var ocan = document.querySelector('.ocan');
  //画布
  var ctx = ocan.getContext('2d');
  //开始按钮
  var start = document.querySelector('.start');
  //暂停按钮
  var suspend = document.querySelector('.suspend');
  //存储砖头的信息
  var rectArr = [];
  //定时器
  var timer = null;
  //是否支持键盘操作
  var keyParss = true;
  //是否弹出game over
  var over = false;
  //空格锁
  var key = true;

  //砖头
  var rect = {
    width:45,
    height:10,
    left:29,
    top:40,
    row:5,
    col:5,
  }
  
  //球的属性
  var ball = {
    width:10,
    height:10,
    x: (ocan.offsetWidth - 10)/2,
    y: ocan.offsetHeight - 30,
    start:0,
    over:Math.PI * 2,
    leftSpeed:2,
    topSpeed:2,
    baseSpeed:2,
  }

  //滑块属性
  var slider = {
    width:50,
    height:10,
    x:(ocan.offsetWidth/2) - 30,
    y:ocan.offsetHeight - 20,
  }

  //记分属性
  var num = {
    font:'14px 雅黑',
    textNum:0,
    levels:0,
    textNumX:15,
    textNumY:30,
    levelsX:ocan.offsetWidth - 80,
    levelsY:30,
  }

  //初始化存储砖块信息
  function initRect() {
    rectArr = new Array(rect.row);
    var len = rectArr.length;
    for(var i = 0; i < len; i++){
      rectArr[i] = new Array(rect.col);
      var len = rectArr[i].length;
      for(var j = 0; j < len; j++){
        rectArr[i][j] = {
          x:0,
          y:0,
          statu:1
        };
      }
    }
  }
  
  //绘制砖块
  function creatRect() {
    var rowlen = rect.row;
    var collen = rect.col;
    for(var i = 0; i < rowlen; i++){
      for(var j = 0; j < collen; j++){
        if(rectArr[i][j].statu == 1){
          ctx.beginPath();
          ctx.fillStyle = 'blue';
          rectArr[i][j].x = (i * (rect.width+ rect.left)) + rect.left;
          rectArr[i][j].y = (j * (rect.height+rect.top /2)) + rect.top;
          ctx.fillRect((i * (rect.width+ rect.left)) + rect.left, (j * (rect.height+rect.top /2)) + rect.top,rect.width,rect.height);
          ctx.closePath()
        }
      }
    }
  }

  //弹球
  function creatBall() {
    ctx.beginPath();
    ctx.arc(ball.x,ball.y,ball.width,0,Math.PI * 2,1);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath()
  }

  //滑块
  function creatSlider() {
    ctx.beginPath();
    ctx.fillStyle = 'green';
    ctx.rect(slider.x,slider.y,slider.width,slider.height);
    ctx.fill()
    ctx.closePath()
  }

  //记分
  function creatNum() {
    if(num.textNum === rect.row * rect.col){
      num.levels++;
    }
    ctx.beginPath();
    ctx.fillStyle = 'origin';
    ctx.font = '14px 雅黑';
    ctx.fillText('levels : ' + num.levels, num.levelsX,num.levelsY);
    ctx.fillText('分数 : '+ num.textNum,num.textNumX,num.textNumY);
    ctx.closePath()
    if(over){
      ctx.beginPath();
      ctx.font = '30px 雅黑';
      ctx.textBaseline= 'center';
      ctx.fillText('Game Over',ocan.offsetWidth/2 - 80,ocan.offsetHeight/2);
      ctx.closePath()
    }
  }

  //生成所有元素
  function creatAll() {
    creatBall();
    creatRect();
    creatSlider()
    creatNum()
  }

  //绑定事件
  function bindEvent() {
    document.addEventListener('keydown',keyDown);
    start.addEventListener('click',startClick);
    suspend.addEventListener('click',suspendClick);
    ocan.addEventListener('mouseenter',ocanEnter);
    ocan.addEventListener('mouseleave',ocanLeave);
  }

  //键盘落下事件
  function keyDown(e) {
    //左37 右39 空格32
    var e = e || window.event;
    if(keyParss){
      ctx.clearRect(slider.x,slider.y,slider.width,slider.height);
      if(e.keyCode === 37){
        slider.x -= 5;
        //边界限定使滑块不会超出边界
        if(slider.x < 0){
          slider.x = 0;
        }
      }else if(e.keyCode === 39){
        slider.x += 5;
         //边界限定使滑块不会超出边界
        if(slider.x > ocan.offsetWidth - slider.width){
          slider.x = ocan.offsetWidth - slider.width;
        }
      }
      creatSlider()
    }
    if(e.keyCode === 32){
      suspend()
    }
  }

  //弹球运动
  function move () {
    //清除所有的东西
    
    ball.x -= ball.leftSpeed;
    ball.y -= ball.topSpeed;
    if(ball.x <= 0 || ball.x > ocan.offsetWidth - ball.width){
      ball.leftSpeed *= -1.1;
    }
    if(ball.y <= 0 ){
      ball.topSpeed *= -1;
    }
    //弹球和滑板接触
    if(ball.y + ball.height > slider.y && ball.y < slider.y + slider.height){
      if(ball.x > slider.x && ball.x < slider.x + slider.width ){
        if(ball.leftSpeed < 0){
           ball.leftSpeed = -ball.baseSpeed;
          ball.topSpeed = -ball.baseSpeed;
        }
        ball.leftSpeed *= -1;
        ball.topSpeed *= -1;
      }
    }else if(ball.y > slider.y + slider.height){
      over = true;
      cancelAnimationFrame(timer)
      creatNum()
      return
    }
    ctx.clearRect(0,0,ocan.offsetWidth,ocan.offsetHeight);
    change()
    creatAll()
    timer = requestAnimationFrame(move)
  }

  //砖块消失,弹球碰到砖块的条件
  function change() {
    var row = rectArr.length,
    col = rectArr[0].length;
    for( var i = 0; i < row; i++){
      for(var j = 0; j < col; j++){
        var item = rectArr[i][j];
        //如果状态是1说明砖头还没被碰到
        if(item.statu === 1){
          if(ball.x  > item.x  && ball.x < item.x + rect.width && ball.y > item.y && ball.y < item.y + rect.height ){
            item.statu = 0;
            ball.leftSpeed *= -1;
            ball.topSpeed *= -1;
            num.textNum++;
          }
        }
      }
    }
    cancelAnimationFrame(timer)
  }

  //start开始点击事件
  function startClick() {
    //初始化属性
    //砖头属性
    rect = {
      width:45,
      height:10,
      left:29,
      top:40,
      row:5,
      col:5,
    }
    
    //球的属性
    ball = {
      width:10,
      height:10,
      x: (ocan.offsetWidth - 10)/2,
      y: ocan.offsetHeight - 30,
      start:0,
      over:Math.PI * 2,
      leftSpeed:2,
      topSpeed:2,
      baseSpeed:2,
    }
  
    //滑块属性
    slider = {
      width:50,
      height:10,
      x:(ocan.offsetWidth/2) - 30,
      y:ocan.offsetHeight - 20,
    }
  
    //记分属性
   num = {
      font:'14px 雅黑',
      textNum:0,
      levels:0,
      textNumX:15,
      textNumY:30,
      levelsX:ocan.offsetWidth - 80,
      levelsY:30,
    }
    over = false
    creatAll()
    initRect()
    move()
    
  }

  //suspend暂停点击事件
  function suspendClick() {
    if(key){
      cancelAnimationFrame(timer);
      key = false
    }else{
      move()
      key = true;
    }
  }
  
  //ocan鼠标进入事件
  function ocanEnter() {
    document.addEventListener('mousemove',docuMove)
  }
  
  //document鼠标移动事件
  function docuMove(e) {
    var x = e.pageX - ocan.offsetLeft - rect.width/2;
    if(x > ocan.offsetWidth - rect.width){
      x = e.pageX - ocan.offsetLeft - rect.width
    }else if(x < 0){
      x = e.pageX - ocan.offsetLeft
    }
    slider.x = x;
  }

  //ocan鼠标离开事件
  function ocanLeave() {
    document.removeEventListener('mousemove',docuMove);
  }

  //初始化
  function init() {
    initRect()
    bindEvent()
    creatAll()
  }

  init()
  
}())