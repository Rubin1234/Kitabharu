
let statuses = document.querySelectorAll('.status_line');
let hiddenInput =  document.querySelector('#hiddenInput');
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);

let time = document.createElement('small');





updateStatus(order);

function updateStatus(order){
    statuses.forEach(function(status){
        status.classList.remove('step-completed');
        status.classList.remove('current');
    })

    let stepComplete = true;

    statuses.forEach((status,index) => {
        let dataProp = status.dataset.status;
        
        if(stepComplete){
            status.classList.add('step-completed');
        }
        
        if(dataProp === order.status){
            stepComplete = false;

            time.innerText = moment(order.UpdatedAt).format('hh:mm  A');
            status.appendChild(time)

            if(status.nextElementSibling){
            status.nextElementSibling.classList.add('current')  }
        }
    });

}