let daynames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    prja = [1, 2, 3, 1, 2],
    prjb = [3, 2, 3, 1, 1],
    prjc = [1, 3, 1, 1, 1],
    prjd = [3, 1, 1, 1, 3],
    training = [0, 0, 0, 4, 1],

    ctx = document.getElementById("myChart"),
    myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: daynames,
        datasets: [
          {
            data: prja,
            label: "Project A",
            backgroundColor: "rgba(20,40,60,.8)",
          },
          {
            data: prjb,
            label: "Project B",
            backgroundColor: "rgba(118,0,0,.8)",
          },
          {
            data: prjc,
            label: "Project C",
            backgroundColor: "rgba(2,2,2.8)",
          },
          {
            data: prjd,
            label: "Project D",
            backgroundColor: "rgba(53,114,102,.8)"
          },
          {
            data: training,
            label: "Training",
            backgroundColor: "rgba(163,187,173,.8)",
          }
        ]
      },
      options: {
        scales: {
          xAxes: [{stacked: true}],
          yAxes: [{stacked: true}]
        },
/*
        legend: { display: false},
*/
        legendCallback: function(chart) {
            var i = 0;
            var x = 0;
            var chargeTypeTotal = {};

            for (i; i < myChart.data.datasets.length; i++) {
                x = 0;
                chargeTypeTotal[i] = 0;
                for (x; x < myChart.data.datasets[i].data.length; x++) {
                    chargeTypeTotal[i] += myChart.data.datasets[i].data[x]; 
                }
                var labelWithoutTotal = myChart.data.datasets[i].label.split(' (')[0];
                myChart.data.datasets[i].label = labelWithoutTotal + chargeTypeTotal[i];
            }
            myChart.update();
        },
        legend: {
            onHover: function(evt, legendItem) {
                evt.stopPropagation();
                $('#custom-chart-tooltip').css('left', evt.pageX + 'px');
                $('#custom-chart-tooltip').css('top', evt.pageY + 'px');
                $('#custom-chart-tooltip').addClass('active').html('Click to show/hide Charge Type');
                $('body').css('cursor','pointer');
            }
        },
        tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
                label: function(tooltipItem, data) {
                    var labelWithoutTotal = data.datasets[tooltipItem.datasetIndex].label.split(' (')[0];
                    return labelWithoutTotal; //+ tooltipItem.yLabel;
                }
            }
        }
      }
    });
    
let initSelects = function() {
    // Select init
    let chartLabels = document.getElementsByClassName('chargetypeselect');
    $.each(chartLabels, function(selectindex, select) {
        $(select).find('option').remove();
        myChart.data.datasets.forEach(function(el, i) {
          let option = document.createElement('option');
          option.value = i;
          option.text = el.label.split(' (')[0];
          chartLabels[selectindex].appendChild(option);
        });
    });

    let accountselects = document.getElementsByClassName('accountselect');
    $.each(accountselects, function(selectindex, select) {
        $(select).find('option').remove();
        myChart.data.labels.forEach(function(el, i){
          let option = document.createElement('option');
          option.value = i;
          option.text = el;
          accountselects[selectindex].appendChild(option);
        });
    });
}

// Drag & Drop
function allowDrop(e) {
  e.preventDefault();
}

let dragdrop_elem = null;
let dropPoint = null;

function drag(e) {
  dragdrop_elem = myChart.getElementAtEvent(e)[0];
  closeTip(myChart, dragdrop_elem._datasetIndex, dragdrop_elem._index);
  $('#custom-chart-tooltip').addClass('active').html('$' + myChart.data.datasets[dragdrop_elem._datasetIndex].data[dragdrop_elem._index] + ' from ' + dragdrop_elem._model.label);
}

function drop(e) {
  e.preventDefault();
  dropPoint = myChart.getElementAtEvent(e)[0];
  if (dropPoint){
    $('#custom-chart-tooltip').removeClass('active').html('');
    $('#dragndropconfirm').modal('show');
  }
}

ctx.draggable = true;

ctx.ondragstart = function(e){
  drag(e);

};

ctx.ondrop = function(e){
  drop(e);
};

ctx.ondragover = function(e) {
  allowDrop(e);
};

// Context Menu
let menu = document.getElementById('chargetype-context-menu');
let transfermenu = document.getElementById('transfer-context-menu');
let totalscirclemenu = document.getElementById('totalscircle-context-menu');
let target_elem = null;

ctx.onclick = function(evt){
  menu.style.display = 'none';
  transfermenu.style.display = 'none';
  totalscirclemenu.style.display = 'none';
};

document.getElementById('totalscircle').oncontextmenu = function(evt) {
   evt.preventDefault(); 

  totalscirclemenu.style.left = (evt.pageX - 60)+ 'px';
  totalscirclemenu.style.top = evt.pageY + 'px';

  totalscirclemenu.style.display = 'block';
  menu.style.display = 'none';
  transfermenu.style.display = 'none';
};

$('body').on('mousemove', function(evt) {
  let target = myChart.getDatasetAtEvent(evt);
  $('#custom-chart-tooltip').removeClass('active').html('');
  $('body').css('cursor','default');
});



ctx.oncontextmenu = function(e){
  e.preventDefault();
  let rect = ctx.getBoundingClientRect(),
      x = e.clientX - rect.left,
      y = e.clientY - rect.top;

  menu.style.left = x + 1 + 'px';
  menu.style.top = y + 1 + 'px';

  transfermenu.style.left = x + 1 + 'px';
  transfermenu.style.top = y + 1 + 'px';

  target_elem = myChart.getElementAtEvent(e)[0];

  if (target_elem) {
//    chartLabels.options[target_elem._datasetIndex].selected = 'selected';
    $('.chargetypeselect').each(function(index, select) {
        $(select).val(target_elem._datasetIndex);
    });
    var chargeType = target_elem._model.datasetLabel.split(' (')[0];
    $(menu).find('#addElem').html('Add to ' + chargeType + ' in ' + target_elem._model.label);
    $(menu).find('#deleteElem').html('Delete from ' + chargeType + ' in ' + target_elem._model.label);
    transfermenu.style.display = 'none';
    menu.style.display = 'block';
  }
  else {
    menu.style.display = 'none';
    transfermenu.style.display = 'block';
  }
};

// Delete Element
/*
let deleteElem = document.getElementById('deleteElem');

deleteElem.onclick = function(e){
  e.preventDefault();
  if (target_elem) {
    let value = myChart.data.datasets[target_elem._datasetIndex].data[target_elem._index];

    myChart.data.datasets[target_elem._datasetIndex].data[target_elem._index] -= value;
    myChart.update();
  }
  menu.style.display = 'none';
};
*/

// Add New Data
let submit_btn = document.getElementById('onSubmit');

submit_btn.onclick = function(e){
  let selected_label = document.getElementById('chartLabels'),
      value_input = document.getElementById('chartValue');

  if (selected_label && target_elem && value_input.value !== '') {
    myChart.data.datasets[selected_label.value].data[target_elem._index] += parseInt(value_input.value);
    myChart.update();
    myChart.generateLegend();
    calculateChargeTypeTotal(defaultlimit);
  } else {
    e.preventDefault();
  }

  selected_label.value = '';
  value_input.value = '';
  menu.style.display = 'none';
};

// Transfer whole amount (drag and drop from one charge type to another)
let executetransferwholeamount = document.getElementById('executetransferwholeamount');

executetransferwholeamount.onclick = function(e) {
    let value = myChart.data.datasets[dragdrop_elem._datasetIndex].data[dragdrop_elem._index];
    myChart.data.datasets[dragdrop_elem._datasetIndex].data[dropPoint._index] += value;
    myChart.data.datasets[dragdrop_elem._datasetIndex].data[dragdrop_elem._index] -= value;
    myChart.update();
}

// transfer specific amount (drag and drop from one charge type to another)
let executetransferspecificamount = document.getElementById('executetransferspecificamount');

executetransferspecificamount.onclick = function(e) {
        $('#dragndropconfirm').modal('hide');
        $('#dragndrophowmuch').modal('hide');
        let value = parseFloat($('#dragndrophowmuch_value').val());
        if (value <= myChart.data.datasets[dragdrop_elem._datasetIndex].data[dragdrop_elem._index]) {
            myChart.data.datasets[dragdrop_elem._datasetIndex].data[dropPoint._index] += value;
            myChart.data.datasets[dragdrop_elem._datasetIndex].data[dragdrop_elem._index] -= value;
            myChart.update();
        }
        $('#custom-chart-tooltip').removeClass('active').html('');
}

// click callback to show "how much do you want to transfer?" modal
let transferspecificamount = document.getElementById('transferspecificamount');

transferspecificamount.onclick = function(e) {
    $('#dragndropconfirm').modal('hide');
}



// Delete amoutn from charge type
let executedeletefromchargetype = document.getElementById('executedeletefromchargetype');

executedeletefromchargetype.onclick = function(e){
  let selected_label = document.getElementById('delete_from_chartLabels'),
      value_input = document.getElementById('delete_from_chartValue');

  if (selected_label && target_elem && value_input.value !== '' && value_input.value <= myChart.data.datasets[selected_label.value].data[target_elem._index]) {
    myChart.data.datasets[selected_label.value].data[target_elem._index] -= parseInt(value_input.value);
    myChart.update();
    myChart.generateLegend();
    calculateChargeTypeTotal(defaultlimit);
  } else {
    e.preventDefault();
  }

  selected_label.value = '';
  value_input.value = '';
  menu.style.display = 'none';
};


// Execute transfer from context menu
let executetransfer = $('#executetransfer');

executetransfer.on('click', function(e){
  let transferfrom = parseInt($('#transferfrom').val()),
      chargetype = parseInt($('#chargetype').val()),
      transferto = parseInt($('#transferto').val()),
      transferamount = parseFloat($('#transferamount_textfield').val());

  if (transferamount !== '' && transferamount <= myChart.data.datasets[chargetype].data[transferfrom]) {
    myChart.data.datasets[chargetype].data[transferfrom] -= parseFloat(transferamount);
    myChart.data.datasets[chargetype].data[transferto] += parseFloat(transferamount);
    myChart.update();
  } else {
    e.preventDefault();
  }

  $('#transferamount_textfield').val('');

  transfermenu.style.display = 'none';
});

// Adjust total charge type value limit
let executechangelimit = $('#executenewlimit');
let defaultlimit = 40;

let calculateChargeTypeTotal = function(limit) {
    $('#newlimit').val(limit);
    let chargeTypeTotal = 0;
    let chargeTypeValues = {};

    $.each(myChart.data.datasets, function(i, dataset) {
        chargeTypeValues[i] = 0;
        $.each(myChart.data.datasets[i].data, function(x, data) {
            chargeTypeValues[i] += myChart.data.datasets[i].data[x]; 
        });
    });

    $.each(chargeTypeValues, function(chargeTypeId, total) {
       chargeTypeTotal += total; 
    });

    $('#totalscircle').find('span').html(chargeTypeTotal);

    if (chargeTypeTotal < limit) {
        $('#totalscircle').addClass('red');
        $('#totalscircle').removeClass('green');
        $('#totalscircle').removeClass('blue');
    }
    if (chargeTypeTotal == limit) {
        $('#totalscircle').addClass('green');
        $('#totalscircle').removeClass('red');
        $('#totalscircle').removeClass('blue');
    }
    if (chargeTypeTotal > limit) {
        $('#totalscircle').addClass('blue');
        $('#totalscircle').removeClass('green');
        $('#totalscircle').removeClass('red');
    }
}

executechangelimit.on('click', function(e){
  let newlimit = parseInt($('#newlimit').val());
  if (newlimit !== '') {
    defaultlimit = newlimit;
    calculateChargeTypeTotal(defaultlimit);
    $('#newlimit').val(defaultlimit);
  } else {
    e.preventDefault();
  }

  $('#newlimit').val('');

  totalscirclemenu.style.display = 'none';
});


// Create a new Charge Type
let executenewchargetype = $('#executenewchargetype');

executenewchargetype.on('click', function(e){
  let customchargetypename = $('#customchargetypename').val(),
      newchargetypeamount = parseFloat($('#newchargetypeamount').val()),
      newchargetypeaccount = parseInt($('#newchargetypeaccount').val());

  if (newchargetypeamount !== '') {
    let dataObject = []; 
    $.each(myChart.data.datasets, function(index, accountamount) {
        if (index == newchargetypeaccount) {
            dataObject.push(newchargetypeamount);
        }
        else {
            dataObject.push(0);
        }
    });
    myChart.data.datasets.push(
      {
        data: dataObject,
        label: customchargetypename + ' ($' + newchargetypeamount + ')',
        backgroundColor: getRandomRgb('.8'),
      }
    );
    myChart.update();
    initSelects();
    calculateChargeTypeTotal(defaultlimit);
  } else {
    e.preventDefault();
  }

  $('#newchargetypeamount').val('');
  $('#customchargetypename').val('');

  transfermenu.style.display = 'none';
});

document.addEventListener("dragstart", function( event ) {
    var img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    img.style.border = '0px';
    event.dataTransfer.setDragImage(img, 0, 0);
}, false);

document.addEventListener('dragover', function(evt) {
    $('#custom-chart-tooltip').css('left', evt.pageX + 'px');
    $('#custom-chart-tooltip').css('top', evt.pageY + 'px');
}, false);


function openTip(oChart,datasetIndex,pointIndex){
   if(oChart.tooltip._active == undefined)
      oChart.tooltip._active = []
   var activeElements = oChart.tooltip._active;
   var requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];
   for(var i = 0; i < activeElements.length; i++) {
       if(requestedElem._index == activeElements[i]._index)  
          return;
   }
   activeElements.push(requestedElem);
   oChart.tooltip._active = activeElements;
   oChart.tooltip.update(true);
   oChart.draw();
}

function closeTip(oChart,datasetIndex,pointIndex){
   var activeElements = oChart.tooltip._active;
   if(activeElements == undefined || activeElements.length == 0)
     return;
   var requestedElem = oChart.getDatasetMeta(datasetIndex).data[pointIndex];
   for(var i = 0; i < activeElements.length; i++) {
       if(requestedElem._index == activeElements[i]._index)  {
          activeElements.splice(i, 1);
          break;
       }
   }
   oChart.tooltip._active = activeElements;
   oChart.tooltip.update(true);
   oChart.draw();
}

function calculateRandomRgb() {
  var num = Math.round(0xffffff * Math.random());
  var r = num >> 16;
  var g = num >> 8 & 255;
  var b = num & 255;

  var foundmatch = false;

  $.each(myChart.data.datasets, function(index, dataset) {
    var rgba = dataset.backgroundColor.replace(/\s/g, '');

    if (rgba == 'rgb(' + r + ', ' + g + ', ' + b + ',.8)') {
        foundmatch = true;
    }
  });

  if (!foundmatch) {
    return 'rgb(' + r + ', ' + g + ', ' + b + ',.8)';
  }
  return false;
}

function getRandomRgb() {
  var newrgb = calculateRandomRgb();

  while (newrgb == false) {
    newrgb = calculateRandomRgb();
  }
  
  return newrgb;
}

window.openTip = openTip;
window.closeTop = closeTip;

myChart.generateLegend();
initSelects();
calculateChargeTypeTotal(defaultlimit);

