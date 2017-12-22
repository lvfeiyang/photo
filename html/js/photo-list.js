$(function() {
	urlAttr();

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

	zoomage = getZoomage();

	//多图片上传
	showUpmore();
	moreup = getQnUpMore();
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

function urlAttr() {
	var regRet = window.location.search.match(/suffix=([^&]+)/);
	suffix = regRet[1];
	user = "";
	regRet = window.location.search.match(/user=([^&]+)/);
	if (null != regRet) {
		user = regRet[1];
	}
}
function nextPage() {
	addingFlag = true;
	var offset = parseInt($('#image-offset').text());
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
				addHtml += '<td><img src="'+v.Image+'?imageView2/0/w/120/h/120" onclick="zoomImage(\''+v.Image+'\')"/>';
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
function getZoomage() {
	return new Zoomage({
		container: document.getElementById('zoom-container'),
		enableDesktop: false,
		enableGestureRotate: true,
		dbclickZoomThreshold: 0.1,
		maxZoom: 3,
		minZoom: 0.1,
		// onDrag: function(data) {data.x data.y},
		onZoom: function(data) {
			// data.scale.width data.scale.height
			// console.log(data.zoom); $('#show-zoom').text(data.zoom);
			if (0.1 > data.zoom) {
				miniImage();
			}
		},
		// onRotate: function(data) {data.rotate},
	});
}
function zoomImage(imgUrl) {
	$('#image-table').addClass('hidden');
	$('#zoom-container').removeClass('hidden');
	zoomage.load(imgUrl+'?imageView2/2/w/1000/h/2500');
}
function miniImage() {
	$('#zoom-container').addClass('hidden');
	$('#image-table').removeClass('hidden');
	zoomage.load('');
}
function getQnUpMore() {
	return Qiniu.uploader({
		runtimes: 'html5',
		browse_button: 'add-more-image',
		uptoken_func: function() {
			$.ajax({
				url:'/photo/msg/qiniu-token',
				contentType: 'application/json',
				data:JSON.stringify({Bucket:'photo'}),
				type:'post',
				dataType:'json',
				async:false,
				success:function(data) {
					token = data.Token;
				}
			})
			return token;
		},
		unique_names: true,
		get_new_uptoken: false,
		domain: 'photo',
		container: 'more-image-list',
		max_file_size: '100mb',
		max_retries: 3,
		chunk_size: '4mb',
		multi_selection: true,
		dragdrop: true,
		drop_element: 'more-image-list',
		filters: {
			mime_types: [
				{title:"图片文件", extensions:"jpg,png"}
			]
		},
		auto_start: false,
		init: {
			'FilesAdded': function(up, files) {
				plupload.each(files, function(file) {
					// 文件添加进队列后，处理相关的事情
					console.log("add file:", file.name);
					var preloader = new mOxie.Image();
					preloader.onload = function() {
						preloader.downsize(300, 300); //压缩下显示 不影响上传
						var imgsrc = preloader.type=='image/jpeg' ? preloader.getAsDataURL('image/jpeg',80) : preloader.getAsDataURL();
						$('#upmorePhoto #more-image-list').append('<img id="'+file.id+'" src="'+imgsrc+'" />');//prepend <br />  onclick="moreup.removeFile(\''+file.id+'\')"
						// $('#upmorePhoto #more-image-list #'+file.id).click(function(){up.removeFile($(this).attr('id'));});
						preloader.destroy();
						preloader = null;
					};
					preloader.load(file.getSource());
				});
			},
			'FileUploaded': function(up, file, info) {
				var domain = up.getOption('domain');
				var res = JSON.parse(info.response);
				var sourceLink = domain +"/"+ res.key; //上传成功后 域+名

				$.ajax({
					url: '/photo/msg/photo-save',
					contentType: 'application/json',
					data: JSON.stringify({Id: '0', Suffix: suffix, Image: sourceLink}),
					type: 'post',
					dataType: 'json',
					success:function(data) {
						if (data.Result)
							console.log('up success');
							// window.location.reload();
					},
					error:function(jqXHR, textStatus, errorThrown) {
						alert(jqXHR.responseJSON.ErrMsg);
					}
				});
			},
			'UploadComplete': function() {
				alert('up all finish.');
				window.location.reload();
			},
			'Error': function(up, err, errTip) {
				//上传出错时，处理相关的事情
			}
		}
	});
}
function showUpmore() {
	$('#upmorePhoto').on('show.bs.modal', function (event) {
		var modal = $(this);
		modal.find('.modal-body .btn-primary').attr('onclick', "moreImageUp()");
	});
}
function moreImageUp() {
	moreup.start();
}
