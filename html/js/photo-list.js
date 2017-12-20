$(function() {
	showModal();
	uploader = getQnUp();
	domBindChg();

	addingFlag = false;
	if (300 > scrollOver() && addingFlag == false) {
		nextPage();
	}
	$(document).scroll(function(){
		if (300 > scrollOver() && addingFlag == false) {
			nextPage();
		}
	});
});
/*$(document).on("pageinit", "#pageone", function(){
	$(document).on("scrollstop", function(){
		if (300 > scrollOver()) {
			nextPage();
		}
	});
});*/
//内容的高度
function getHeightDom() {
	return document.documentElement.scrollHeight;
}
//窗口的高度
function getHeightWin() {
	return document.documentElement.clientHeight;
}
//滚到条顶部
function getScrollTop() {
	// return document.documentElement.scrollTop;
	var scrollTop = 0;
	if (document.documentElement && document.documentElement.scrollTop) {
		scrollTop = document.documentElement.scrollTop;
	} else if (document.body) {
		scrollTop = document.body.scrollTop;
	}
	return scrollTop;
}
function scrollOver() {
	// $('#dom-height').text(getHeightDom());
	// $('#win-height').text(getHeightWin());
	// $('#scroll-top').text(getScrollTop());
	return getHeightDom() - getHeightWin() - getScrollTop();
}

function nextPage() {
	addingFlag = true;
	var offset = parseInt($('#image-offset').text());
	var regRet = window.location.search.match(/suffix=([^&]+)/);
	var suffix = regRet[1];
	var user = "";
	regRet = window.location.search.match(/user=([^&]+)/);
	if (null != regRet) {
		user = regRet[1];
	}
	$.ajax({
		url: '/photo/msg/photo-page',
		contentType: 'application/json',
		data: JSON.stringify({Offset: offset, Limit: 30, Suffix: suffix}),
		type: 'post',
		dataType: 'json',
		success:function(data) {
			var addHtml = "";
			for (var i in data.PhotoList) {
				var v = data.PhotoList[i];
				if (0 == i % 3) {
					addHtml += '<tr>';
				}
				addHtml += '<td><img src="'+v.Image+'?imageView2/0/w/120/h/120" />';
				if ("admin" == user) {
					addHtml += '<br /><button class="btn btn-default btn-xs" type="button" '+
						'data-toggle="modal" data-target="#editPhoto" data-photo-id='+v.Id+'>修改</button>';
				}
				addHtml += '</td>';
				if (0 == (i + 1) % 3) {
					addHtml += '</tr>';
				}
			}
			var listLen = (null == data.PhotoList)? 0: data.PhotoList.length;
			if (0 != listLen % 3) {
				addHtml += '</tr>';
			}
			$('#image-table').append(addHtml);
			if (30 > listLen && $('#image-end').length <= 0) {
				$('#image-table').after('<p id="image-end">无更多图片</p>');
				$(document).unbind('scroll');
			}
			$('#image-offset').text(offset+listLen);
			addingFlag = false;
		}
	});
}
