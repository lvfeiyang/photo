$(function() {
	$('.navbar button').bind('click', addOneLine);
})
function addOneLine() {
	$('table tbody').prepend('<tr id="add-tmp"><td></td><td><input type="text" /></td><td></td></tr>');
	var newDom = $('table tbody #add-tmp');
	newDom.find('input').focusout({id:'add-tmp', col:2}, function(event){saveUser(event.data['id'],event.data['col']);});
}
function showInput(id, col) {
	var tdDom = $('table tbody #'+id+' td:nth-child('+col+')');
	var tdText = tdDom.text();
	tdDom.html('<input type="text" autofocus="autofocus" />');
	tdDom.removeAttr('ondbclick');
	tdDom.find('input').focus().val(tdText);
	tdDom.find('input').focusout({id:id, col:col}, function(event){saveUser(event.data['id'],event.data['col']);});
}
function saveUser(userId, column) {
	var trDom = $('table tbody #'+userId);
	var tdVal = trDom.find('td:nth-child('+column+') input').val();

	var data = {Id:userId};
	switch (column) {
		case 1:{
			data.Name = tdVal;
			break;
		}
		case 2:{
			data.Suffix = tdVal;
			break;
		}
		case 3:{
			data.Desc = tdVal;
			break;
		}
		default: {
			break;
		}
	}
	$.ajax({
		url: '/photo/msg/user-save',
		contentType: 'application/json',
		data: JSON.stringify(data),
		type: 'post',
		dataType: 'json',
		success: function(data) {
			if (data.Result) {
				window.location.reload();
				// $('table tbody #add-tmp').attr('id', data.id);
			}
		}
	});
}
function delRepeat() {
	$.ajax({
		url: '/photo/msg/photo-del-repeat',
		contentType: 'application/json',
		data: JSON.stringify({Id:0}),
		type: 'post',
		dataType: 'json',
		success: function(data) {
			if (data.Result) {
				alert('del repeat');
			}
		}
	});
}
