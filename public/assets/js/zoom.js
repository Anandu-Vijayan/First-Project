

function imageZoom(imgID){
    let img = document.getElementById(imgID)
    let lens = document.getElementById(imgID)

    lens.style.backgroundImage =`url( ${img.src} )`

    let ratio = 3

    lens.style.backgroundSize =(img.width + ratio) +'px ' + (img.height + ratio) +'px ';
    img.addEventListener("mousemove",moveLens)

    lens.addEventListener("mousemove",moveLens)

    img.addEventListener("touchmove",moveLens)

    function moveLens(){
        let pos= getCursor()
        console.log('pos:',pos);

    }
    function getCursor(){
        let y=0
        let x=0
        return{'x':'x','y':y}

    }


}
imageZoom('featured')