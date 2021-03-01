 // state
 let draw = false
 let erase = false
 let SCROLL_LOCKED = false

 // elements
 let points = []
 let lines = []
 let svg = null

 document.addEventListener('DOMContentLoaded', () => {
     loadSettings()
     render()
 })

 function render() {
     

     // create the selection area
     svg = d3.select('#draw')
             .attr('height', window.innerHeight)
             .attr('width', window.innerWidth)

     // MOUSE EVENTS
     svg.on('mousedown', function() {
         draw = true;
         const coords = d3.mouse(this);
         draw_point(coords[0], coords[1], connect=false, removePoint=erase)
     });

     svg.on('mouseup', () =>{
         if (!(erase)) {
             draw = false;
         }
     });

     svg.on('mousemove', function() {
         if (!draw)
             return;
         const coords = d3.mouse(this);
         draw_point(coords[0], coords[1], connect=true, removePoint=erase);
     });

     // TOUCH EVENTS
     svg.on('touchstart', function() {
         draw = true;
         const coords = d3.mouse(this);
         draw_point(coords[0], coords[1], connect=false, removePoint=erase);
     });

     svg.on('touchend', () =>{
         draw = false;
     });

     svg.on('touchmove', function() {
         if (!draw)
             return;
         const coords = d3.mouse(this);
         draw_point(coords[0], coords[1], connect=true, removePoint=erase);
     });


 }

 function draw_point(x, y, connect, removePoint) {
     const color = document.querySelector('#colorPicker').value;
     const thickness = document.querySelector('#thicknessPicker-Point').value;
     
     if (!(removePoint)) {
         if (connect) {
             const last_point = points[points.length - 1];
             const line = svg.append('line')
                             .attr('x1', last_point.attr('cx'))
                             .attr('y1', last_point.attr('cy'))
                             .attr('x2', x)
                             .attr('y2', y)
                             .attr('stroke-width', thickness * 2)
                             .style('stroke', color);
             lines.push(line);
         }

         const point = svg.append('circle')
                         .attr('cx', x)
                         .attr('cy', y)
                         .attr('r', thickness)
                         .style('fill', color);
             points.push(point);
     }
     else {
         let coords = d3.mouse(document.querySelector('#draw'))

         eraserCircle.transition()
                         .duration(1)
                         .attr('cx', coords[0])
                         .attr('cy', coords[1])
         
         let mouse_x = new Set([ coords[0] ])
         let mouse_y = new Set([ coords[1]  ])


         // Get a range of coords around the exact position of the mouse (-5, 5)
         let eraseSize = document.querySelector('#thicknessPicker-Eraser').value
         for (let i = -eraseSize; i <= eraseSize; i ++) {
             mouse_x.add(coords[0] + i)
             mouse_y.add(coords[1] + i)
         }
         
         // Remove points
         points.forEach(point => {
             let point_x = parseInt(point.attr('cx'))
             let point_y = parseInt(point.attr('cy'))

             if (mouse_x.has(point_x) && mouse_y.has(point_y)) {                        
                 // Remove point from points array
                 let indexOfPointToRemove = points.indexOf(point)
                 points.splice(indexOfPointToRemove, 1)
                 // Remove point from UI
                 point.remove()
             }
             // console.log(`point cx: ${point.attr('cx')} point cy: ${point.attr('cy')}\nmouse cx: ${mouse_x} mouse cy: ${mouse_y}`)
         })

         mouse_x = castSetToArray(mouse_x)
         mouse_y = castSetToArray(mouse_y)

         // Remove lines
         lines.forEach(line => {
             let removeLine = false

             let line_x1 = parseInt(line.attr('x1'))
             let line_x2 = parseInt(line.attr('x2'))
             
             let line_y1 = parseInt(line.attr('y1'))
             let line_y2 = parseInt(line.attr('y2'))


             let Line_X1 = min([line_x1, line_x2])
             let Line_X2 = max([line_x1, line_x2])

             let Line_Y1 = min([line_y1, line_y2])
             let Line_Y2 = max([line_y1, line_y2])
             
             // console.log(`line x1: ${line_x1}\nline x2: ${line_x2}\n\nline y1: ${line_y1}\nline y2: ${line_y2}`)

             // mouse_x and mouse_y has the same size so either one would word for i <
             for (let i = 0; i < mouse_x.length; i++) {
                 // Check if mouse_x and mouse_y is between the start and end of the line
                 if ( (mouse_x[i] >= Line_X1 && mouse_x[i] <= Line_X2) && ( (mouse_y[i] >= Line_Y1 && mouse_y[i] <= Line_Y2) ) ) {
                      // Remove line from UI
                     line.remove()   
                     removeLine = true       
                 }
             }
             if (removeLine) {
                 //  Remove line from lines array
                 let indexOfLineToRemove = lines.indexOf(line)
                 lines.splice(indexOfLineToRemove, 1)
                 removeLine = false
             }
         })
     }
 }

 // OPEN AND CLOSE SIDE BAR
 document.querySelector('#hamburgerBtn').addEventListener('click', ()=> {
     let sideBarContainer = document.querySelector('.side-bar-container')
     if (sideBarContainer.dataset.to_animate === 'Right') {
         sideBarContainer.style.animationName = 'moveRight'
         sideBarContainer.style.animationDuration = '0.5s'
         sideBarContainer.style.animationFillMode = 'forwards'

         sideBarContainer.addEventListener('animationend', ()=> {
             sideBarContainer.dataset.to_animate = 'Left'
         })
     }
     if (sideBarContainer.dataset.to_animate === 'Left') {
         sideBarContainer.style.animationName = 'moveLeft'
         sideBarContainer.style.animationDuration = '0.5s'
         sideBarContainer.style.animationFillMode = 'forwards'

         sideBarContainer.addEventListener('animationend', ()=> {
             sideBarContainer.dataset.to_animate = 'Right'
         })

     }
 })

 // ERASER BUTTON
 document.querySelector('#eraserBtn').addEventListener('click', () => {
     let thicknessLabel = document.querySelector('#thicknessLabel')
     let pointThicknessSelect = document.querySelector('#thicknessPicker-Point')
     let eraserBtn = document.querySelector('#eraserBtn')
     let eraserThicknessSelect = document.querySelector('#thicknessPicker-Eraser')
     

     if (erase === false) {
         // Remove point thickness select
         pointThicknessSelect.style.display = 'none'
         // Show eraser thickness select
         thicknessLabel.textContent = 'Eraser Thickness'
         eraserThicknessSelect.style.display = ''

         // Add eraser circle
         eraserCircle = svg.append('circle')
                                                .attr('cx', 0)
                                                .attr('cy', 0)
                                                .attr('r', document.querySelector('#thicknessPicker-Eraser').value)
                                                .style('fill', 'grey')
                                                .style('opacity', 0.5)
         eraserBtn.style.border = '2px solid blue'
         erase = true
         draw = true
     }
     else {
         // Change the label
         thicknessLabel.textContent = 'Point Thickness'
         // Remove eraser thickness select
         eraserThicknessSelect.style.display = 'none'
         // Show the point thickness select
         pointThicknessSelect.style.display = ''
         // Remove the eraser circle
         eraserCircle.remove()
         eraserBtn.style.border = ''
         // Change states
         erase = false
         draw = false
     }
     
 })
 // Change eraser size UI
 document.querySelector('#thicknessPicker-Eraser').onchange = function() {
     eraserCircle.style('r', this.value)
 }
     
 // LOCK SCROLL BUTTON
 document.querySelector('#lockScrollBtn').addEventListener('click', () => {
     let body = document.querySelector('body')
     let lockScrollBtn = document.querySelector('#lockScrollBtn')
     let bgColor = JSON.parse(localStorage.getItem('userSettings'))['bgColor']
     
     if (body.className === '') {
         SCROLL_LOCKED = true
         // DISABLE SCROLL
         body.className = 'stop-scrolling'
         // For mobile
         $('body').bind('touchmove', function(e){e.preventDefault()})

         // Change icon
         if (bgColor === 'white') {
             lockScrollBtn.src = '/Img/black_lock_icon(lock).svg'
         }
         else if (bgColor === 'black') {
             lockScrollBtn.src = '/Img/white_lock_icon(lock).svg'
         }
         
     }
     else {
         SCROLL_LOCKED = false
         body.className = ''
         // For mobile
         $('body').unbind('touchmove')

         // Change icon
         if (bgColor === 'white') {
             lockScrollBtn.src = '/Img/black_lock_icon(unlock).svg'
         }
         else if (bgColor === 'black') {
             lockScrollBtn.src = '/Img/white_lock_icon(unlock).svg'
         }
     }

 }) 

 // START OVER BUTTON
 document.querySelector('#startOverBtn').onclick = () => {
         for (let i = 0; i < points.length; i++)
             points[i].remove();
         for (let i = 0; i < lines.length; i++)
             lines[i].remove();
         points = [];
         lines = [];
     }

 // LOAD SETTINGS
 function loadSettings() {
     if (!(localStorage.getItem('userSettings'))) {
         // Load default settings
         let userSettings = {
             'bgColor': 'white',
             'penColor': 'black',
             'pointThickness': 3
         }    
         localStorage.setItem('userSettings', JSON.stringify(userSettings))
         return
     }

     let body = document.querySelector('body')
     let mainHeading = document.querySelector('#mainHeading')
     let sideBarContainer = document.querySelector('.side-bar-container')
     let colorPickerSelect = document.querySelector('#colorPicker')
     let pointThicknessSelect = document.querySelector('#thicknessPicker-Point')
     let hamburgerBtn = document.querySelector('#hamburgerBtn')
     let startOverBtn = document.querySelector('#startOverBtn')
     let eraserBtn = document.querySelector('#eraserBtn')
     let lockScrollBtn = document.querySelector('#lockScrollBtn')
     let whitePen = document.querySelector('#whitePen')
     let blackPen = document.querySelector('#blackPen')

     // Load backgroundColor
     let userSettings = JSON.parse(localStorage.getItem('userSettings'))

     if (userSettings['bgColor'] === 'white') {
         runThemeTransistion('lightMode')
         // Change the colors of the page
         body.style.backgroundColor = 'white'
         mainHeading.style.color = 'black'
         sideBarContainer.style.backgroundColor = 'white'
         startOverBtn.style.backgroundColor = 'rgb(0, 105, 217)'
         // Change the color of the select labels
         document.querySelectorAll('.inputLabel').forEach(label => {
             label.style.color = 'black'
         })
         // Change the color of the select boxes
         let allSelects = [document.querySelector('#backgroundPicker'), document.querySelector('#colorPicker'), document.querySelector('#thicknessPicker-Point'), document.querySelector('#thicknessPicker-Eraser')]
         allSelects.forEach(select => {
             select.style.backgroundColor = 'white'
             select.style.borderColor = ''
             select.style.color = 'black'
         })
         // Change the Button icons
         hamburgerBtn.src = '/Img/Hamburger_icon.svg.png'
         eraserBtn.src = '/Img/black_eraser.svg'
         if (SCROLL_LOCKED)
             lockScrollBtn.src = '/Img/black_lock_icon(lock).svg'
         else
             lockScrollBtn.src = '/Img/black_lock_icon(unlock).svg'
         // Change the color of the pen
         document.querySelector('#blackPen').selected = true
         // Change the selection option
         document.querySelector('#white').selected = true

         // Remove white pen option
         whitePen.style.display = 'none'
         blackPen.style.display = ''

     }
     else if (userSettings['bgColor'] === 'black') {
         runThemeTransistion('darkMode')
         // Change the colors of the page
         body.style.backgroundColor = 'black'
         mainHeading.style.color = 'white'
         sideBarContainer.style.backgroundColor = 'rgb(31, 30, 30)'
         startOverBtn.style.backgroundColor = 'darkblue'
         document.querySelectorAll('.inputLabel').forEach(label => {
             label.style.color = 'white'
         })
         let allSelects = [document.querySelector('#backgroundPicker'), document.querySelector('#colorPicker'), document.querySelector('#thicknessPicker-Point'), document.querySelector('#thicknessPicker-Eraser')]
         allSelects.forEach(select => {
             select.style.backgroundColor = 'rgb(31, 30, 30)'
             select.style.borderColor = 'grey'
             select.style.color = 'white'
         })
         // Change button icons
         hamburgerBtn.src = '/Img/white_hamburger_icon.jpg'
         eraserBtn.src = '/Img/white_eraser.svg'
         if (SCROLL_LOCKED)
             lockScrollBtn.src = '/Img/white_lock_icon(lock).svg'
         else
             lockScrollBtn.src = '/Img/white_lock_icon(unlock).svg'

         // Change the color of the pen
         document.querySelector('#whitePen').selected = true
         // Change the select option
         document.querySelector('#black').selected = true

         // Remove black pen option
         blackPen.style.display = 'none'
         whitePen.style.display = ''
     }

     // Load pen color
    let colorPickerIndex = {
        'white': 0,
        'black': 0,
        'red': 1,
        'blue': 2,
        'green': 3,
    }
    colorPickerSelect.options[colorPickerIndex[userSettings['penColor']]].selected = true

     // Load point thickness
    pointThicknessSelect.options[userSettings['pointThickness']-1].selected = true

 }

 // Update background color
 document.querySelector('#backgroundPicker').onchange = function() {
     // Change drawing color: line
     lines.forEach(line => {
         // If a line is black or white
         if (line.style('stroke') === 'black' || line.style('stroke') === 'white') {
             // If the line is black change it to white
             if (this.value === 'black') {
                 line.style('stroke', 'white')
             }
             // If the line is white change it to black
             else if (this.value === 'white') {
                 line.style('stroke', 'black')
             }
         }
     })
     // Change drawing color: point
     points.forEach(point => {
         if (point.style('fill') === 'black' || point.style('fill') === 'white') {
             // If point is black change it to white
             if (this.value === 'black') {
                 point.style('fill', 'white')
             }
             // If point is white change it to blacl
             else if (this.value === 'white') {
                 point.style('fill', 'black')
             }
         }
     })

     // Remove black of white color pen
     let whitePen = document.querySelector('#whitePen')
     let blackPen = document.querySelector('#blackPen')
     if (this.value === 'white') {
        whitePen.style.display = 'none'
        blackPen.style.display = ''
     }
     else if(this.value === 'black') {
        blackPen.style.display = 'none'
        whitePen.style.display = ''

     }

     // Change bg color
     let userSettings = JSON.parse(localStorage.getItem('userSettings'))
     userSettings['bgColor'] = this.value
     // Add change to storage
     localStorage.setItem('userSettings', JSON.stringify(userSettings))
     loadSettings()
 }

 // Update pen color
 document.querySelector('#colorPicker').onchange = function() {
    let userSettings = JSON.parse(localStorage.getItem('userSettings'))
    userSettings['penColor'] = this.value

    localStorage.setItem('userSettings', JSON.stringify(userSettings))
 }

 // Update point thickness
 document.querySelector('#thicknessPicker-Point').onchange = function() {
    let userSettings = JSON.parse(localStorage.getItem('userSettings'))
    userSettings['pointThickness'] = this.value

    localStorage.setItem('userSettings', JSON.stringify(userSettings))

 }


 // Run theme transition
 function runThemeTransistion(theme) {
     let body = document.querySelector('body')
     let mainHeading = document.querySelector('#mainHeading')
     let sideBarContainer = document.querySelector('.side-bar-container')
     let hamburgerBtn = document.querySelector('#hamburgerBtn')
     let startOverBtn = document.querySelector('#startOverBtn')

     let mode
     if (theme === 'darkMode') {
         mode = 'Dark'
     }
     else if (theme === 'lightMode') {
         mode = 'Light'  
     }

     // Set up bg animations
     body.style.animationName = `bgGo${mode}`
     body.style.animationDuration = '0.7s'
     body.style.animationFillMode = 'forwards'

     // Set up heading animations
     mainHeading.style.animationName = `headingGo${mode}`
     mainHeading.style.animationDuration = '0.7s'
     mainHeading.style.animationFillMode = 'forwards'

     // Set up side bar animations
     sideBarContainer.style.animationName = `sideBarGo${mode}`
     sideBarContainer.style.animationDuration = '0.7s'
     sideBarContainer.style.animationFillMode = 'forwards'

    
     sideBarContainer.style.left = '0%'

     // Set up startOverBtn animation
     startOverBtn.style.animationName = `buttonGo${mode}`
     startOverBtn.style.animationDuration = '0.7s'
     startOverBtn.style.animationFillMode = 'forwards'
     
 }

 // Cast set to array
 function castSetToArray(set) {
     let arrayToReturn = []
     set.forEach(item => {
         arrayToReturn.push(item)
     })
     return arrayToReturn
 }

 function min(numbers) {
     let min_num = Infinity

     numbers.forEach(num => {
         if (num < min_num) {
             min_num = num
         }
     })
     return min_num
 }

 function max(numbers) {
     let max_num = -Infinity

     numbers.forEach(num => {
         if (num > max_num) {
             max_num = num
         }
     })
     return max_num
 }