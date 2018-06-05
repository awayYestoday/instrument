window.onload = function(){
  const namespace = 'instrument-'

  let instrument= document.getElementsByClassName('instrument')

  let tween = null

  let rankToColor = {
    0: {
      color: ['#69fa3c', '#44a825'],
      text: '优'
    },
    1: {
      color: ['#34daf4', '#1C7684'],
      text: '中'
    },
    2: {
      color: ['#ea9349', '#975F2F'],
      text: '差'
    }
  }

  let cValue = 0
  let tValue = 0

  // 计算宽高
  let width = instrument[0].clientWidth
  let height = instrument[0].clientHeight

  // 开始角度
  let startAngle = Math.PI / 6
  let startSin = Math.sin(startAngle)
  let startCos = Math.cos(startAngle)

  // arrow
  let arrowAngle = 5 * Math.PI / 6
  let arrowSin = Math.sin(arrowAngle)
  let arrowCos = Math.cos(arrowAngle)

  // 半径
  let radius = height / (1 + startSin)
  let r = Math.min(radius, width / 2)
  let lineWidth = Math.max(r / 60, 2)

  // 计算中心点
  let x = width / 2
  let y = (height - r * (1 + startSin)) / 2 + r

  // svg
  let svg = d3.select('.instrument-digital')

  // 设置每个canvs宽高和中心点
  let names = ['bg', 'animate', 'bottom', 'arrow']
  names.forEach(name => {
    let canvas = document.getElementsByClassName(`${namespace + name}`)[0]
    canvas.width = width
    canvas.height = height

    let ctx =window[name + 'Ctx']= canvas.getContext('2d')
    ctx.translate(x, y)
  })

  let bgCtx = window.bgCtx
  let animateCtx = window.animateCtx
  let bottomCtx = window.bottomCtx
  let arrowCtx = window.arrowCtx

  // 获取数据
  let getData = function () {
    new Promise (function (resolve, reject) {
      let results = Math.random().toFixed(2) * 100
      resolve({
        data: results
      })
    }).then(function (res) {
      let data = res.data
      cValue = data
      drawAnimate(cValue)
    })
  }

  // 背景
  let drawBg = function () {
    let r1 = r / 3
    let r2 = r1 * 2
    let r3 = r - lineWidth / 2
    drawArc(bgCtx, r1, lineWidth, startAngle, startSin)
    drawArc(bgCtx, r2, lineWidth,startAngle, startSin)
    drawArc(bgCtx, r3, lineWidth,startAngle, startSin)

    // 画底部连接线
    bgCtx.strokeStyle = '#1a2e3f'
    bgCtx.beginPath()
    let x1 = r1 * startCos
    let y1 = r1 * startSin
    let x2 = (r2 + lineWidth / 2) * startCos
    let y2 = (r2 + lineWidth / 2) * startSin
    bgCtx.moveTo(-x2, y2)
    bgCtx.lineTo(-x1, y1)
    bgCtx.lineTo(x1, y1)
    bgCtx.lineTo(x2, y2)
    bgCtx.stroke()

    bgCtx.save()
    bgCtx.strokeStyle = genGrd(bgCtx, -r3, r3 * startSin, 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.2)')
    drawArc(bgCtx, (r3 + r2) / 2, r3 - r2 - lineWidth, Math.PI / 2, 1, true)
    bgCtx.restore()

    let width = r1 * 0.5
    drawArc(bgCtx, r1 * 1.3 + width / 2, width, startAngle, startSin)
    // 画刻度
    let fontSize = r1 / 2
    let scaleHeight = r1 / 10
    let r4 = r2 + lineWidth / 2
    let r5 = r2 + lineWidth / 2 + scaleHeight
    let perAngle = (Math.PI + startAngle * 2) / 10
    let anglea = -Math.PI - startAngle
    let rw = (r2 + lineWidth / 2 + scaleHeight + 10)
    bgCtx.lineWidth = lineWidth / 2
    for (let i = 0; i <= 10; i++) {
      let angle = anglea + perAngle * i
      let sin = Math.sin(angle)
      let cos = Math.cos(angle)
      bgCtx.beginPath()
      bgCtx.moveTo(r4 * cos, r4 * sin)
      bgCtx.lineTo(r5 * cos, r5 * sin)
      bgCtx.stroke()
      // 画数字
      // 
      svg.append('text')
         .attr('x', x + rw * cos)
         .attr('y', y + rw * sin)
         .style('font-size', fontSize)
         .attr('fill', '#6595b5')
         .attr('text-anchor', i < 5 ? 'end' : i === 5 ? 'middle' : 'start')
         .text(10 * i + '')
    }
  }

  // 底部文字
  let drawBottomText = function (text) {
    let r0 = r / 3
    svg.select('.title').remove()
    svg.append('text')
       .attr('x', x)
       .attr('y', y)
       .attr('dy', -r0 * 0.2)
       .attr('text-anchor', 'middle')
       .style('fill', '#d8e3eb')
       .style('font-size', r0 * 0.7)
       .classed('title', true)
       .text(text)
  }
  // 画底部六边形
  let drawBottomBlock = function (color) {
    let r0 = r / 3 * startSin
    let perAngle = Math.PI / 3
    clearCanvas(bottomCtx)
    bottomCtx.save()
    bottomCtx.translate(0, r0)
    bottomCtx.rotate(Math.PI / 2)
    bottomCtx.fillStyle = genGrd(bottomCtx, -r0, r0, color[0], color[1], true)
    bottomCtx.beginPath()
    
    for (let i = 0; i < 7; i++) {
      bottomCtx.lineTo(r0 * Math.cos(i * perAngle), r0 * Math.sin(i * perAngle))
    }

    bottomCtx.fill()
    bottomCtx.restore()
  }

  // 画动态颜色条
  let drawAnimateBlock = function (color, value) {
    let totalAngle = Math.PI + startAngle * 2 - Math.PI / 90
    let perIntervalAngle = Math.PI / 180
    let perAngle = (totalAngle - perIntervalAngle * 19) / 20
    let r0 = r / 3
    let total = 20
    let perval = 100 / total
    let num = Math.ceil(value.val / perval)
    let start = Math.PI - Math.PI / 6 + Math.PI / 180
    let radius = 1.65 * r0 - lineWidth / 2
    let width = 0.7 * r0 - lineWidth
    let gltop = radius + width / 2 // 线性渐变起点
    let glbottom = radius - width / 2 // 线性渐变终点

    // let gl = animateCtx.createLinearGradient(0, -gltop, 0, radius * startSin)
    // gl.addColorStop(0, color[0])
    // gl.addColorStop(1, color[1])
    
    clearCanvas(animateCtx)
    for (let i = 1; i <= num; i++) {
      let stopAngle = start + perAngle
      let glAngle = (stopAngle + start) / 2
      let cos = Math.cos(glAngle)
      let sin = Math.sin(glAngle)
      let gl = animateCtx.createLinearGradient(cos * gltop, sin * gltop, cos * glbottom, sin * glbottom)
      gl.addColorStop(0, color[0])
      gl.addColorStop(1, color[1])
      animateCtx.strokeStyle = gl
      animateCtx.lineWidth = width
      animateCtx.beginPath()
      animateCtx.arc(0, 0, radius, start, stopAngle)
      animateCtx.stroke()
      start = stopAngle + perIntervalAngle
    }
  }

  // 画arrow
  let drawArrow = function (val, color) {
    let r0 = r / 3
    let angle = startAngle - Math.PI / 180
    let startAnglea = -Math.PI - angle
    let angleDelta = Math.PI + 2 * angle
    let r1 = lineWidth * 2

    let ang = startAnglea + angleDelta * val / 100
    let cos = r1 * arrowCos
    let sin = r1 * arrowSin

    clearCanvas(arrowCtx)
    arrowCtx.save()
    arrowCtx.rotate(ang)
    arrowCtx.translate(r0, 0)
    arrowCtx.fillStyle = color
    arrowCtx.beginPath()
    arrowCtx.moveTo(r1, 0)
    arrowCtx.lineTo(cos, sin)
    arrowCtx.lineTo(cos,-sin)
    arrowCtx.fill()
    arrowCtx.restore()
  }
  // 动画
  let drawAnimate = function (data) {
    tween = new TWEEN.Tween({val: tValue})
        .to({val: data}, 1000)
        .onUpdate(function () {
          update(this)
        })
        .start()
        .onComplete(() => {
          tween = null
        })

        function update (val) {
          // 更改底部块的颜色
          let rank = getRank(val)
          let {color, text} = rankToColor[rank]
          drawBottomBlock(color)
          drawArrow(val.val, color[0])
          drawBottomText(text)
          drawAnimateBlock(color, val)
        }
    tValue =cValue
  }

  // 画弧
  let drawArc = function (ctx, r, lineWidth, startAngle, startSin,customGrd = false) {
    if(!customGrd) {
      let grd = genGrd(ctx, -r, r * startSin)
      ctx.strokeStyle = grd
    }
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.arc(0, 0, r, startAngle, -Math.PI - startAngle, true)
    ctx.stroke()
  }

  // 渐变
  let genGrd = function (ctx, top, bottom, color0 = '#34567a', color1 = '#1a2e3f', flag) {
    if (flag) {
      var grd = ctx.createLinearGradient(top, 0, bottom, 0)
    } else {
      var grd = ctx.createLinearGradient(0, top, 0, bottom)
    }
    
    grd.addColorStop(0, color0)
    grd.addColorStop(1, color1)
    return grd
  }

  let getRank = function (val) {
    return val.val >= 90 ? 0 : val.val >= 60 ? 1 : 2
  }

  // let getWidthAngle = function (r, w) {
  //   return Math.asin(w / r)
  // }

  var startAnimate = function () {
    animationFrameId = window.requestAnimationFrame(startAnimate)
    TWEEN.update()
  }

  // 清空画布
  var clearCanvas = function (ctx) {
    ctx.clearRect(-width / 2, -height / 2, width, height)
  }

  startAnimate()
  drawBg()
  getData()
  window.setInterval(getData, 2000)
}

