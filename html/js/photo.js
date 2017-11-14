$(function() {
	$('#editPhoto').on('show.bs.modal', function (event) {
		var button = $(event.relatedTarget);
		var photoId = button.data('photo-id');
		var modal = $(this);
		//ajax here
		if (0 != photoId) {
			$.ajax({
				url:'/photo/msg/photo-info',
				contentType:'application/json',
				data:JSON.stringify({Id:photoId}),
				type:'post',
				dataType:'json',
				async: false,
				success:function(data) {
					modal.find('#photo-time').val(data.Time);
					modal.find('#photo-address').val(data.Address);
					modal.find('#photo-title').val(data.Title);
					modal.find('#photo-image img').attr('src', data.Image + "?imageView2/4/w/300/h/300");
					modal.find('#photo-desc').val(data.Desc);
					haveChgd = new Array();
				}
			});
		} else {
			modal.find('#photo-time').val("");
			modal.find('#photo-address').val("");
			modal.find('#photo-title').val("");
			modal.find('#photo-image img').attr('src', '');
			modal.find('#photo-desc').val("");
			haveChgd = new Array();
		}
		modal.find('.modal-header #photo-id').text(photoId);
		modal.find('.modal-footer .btn-primary').attr('onclick', "putSave()");
	});

	uploader = Qiniu.uploader({
		runtimes: 'html5',
		browse_button: 'photo-image-add',
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
		container: 'photo-image',
		max_file_size: '100mb',
		max_retries: 3,
		chunk_size: '4mb',
		multi_selection: false,
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
						$('#editPhoto #photo-image img').attr('src', imgsrc);
						preloader.destroy();
						preloader = null;
					};
					preloader.load(file.getSource());
					if (-1 === haveChgd.indexOf('photo-image'))
						haveChgd.push('photo-image');
				});
			},
			'FileUploaded': function(up, file, info) {
				var domain = up.getOption('domain');
				var res = JSON.parse(info.response);
				var sourceLink = domain +"/"+ res.key; //上传成功后 域+名
				$('#editPhoto #photo-image img').attr('src', sourceLink);
				savePhoto($('#editPhoto .modal-header #photo-id').text());
			},
			'Error': function(up, err, errTip) {
				//上传出错时，处理相关的事情
			}
		}
	});

	function bindChg() {
		var chgId = $(this).attr('id');
		if (-1 === haveChgd.indexOf(chgId))
			haveChgd.push(chgId);
	}
	$('#editPhoto #photo-time').bind('input propertychange', bindChg);
	$('#editPhoto #photo-address').bind('input propertychange', bindChg);
	$('#editPhoto #photo-title').bind('input propertychange', bindChg);
	$('#editPhoto #photo-desc').bind('input propertychange', bindChg);

	laydate.render({
		elem: '#editPhoto #photo-time',
		done: function(value, date, endDate) {
			if (-1 === haveChgd.indexOf('photo-time'))
				haveChgd.push('photo-time');
		}
	});

	ptSwiper = new Swiper('.swiper-container', {
		direction: 'vertical',
		loop: true,
		speed: 1000,
		autoplay: 3000,
		autoplayDisableOnInteraction: false,
		// width: window.innerWidth,
		height: window.innerHeight,
		roundLengths: true,
		onSlideChangeEnd: function(swiper) {
			// $('.big-img-box #imgDesc'+swiper.realIndex).css('animation', '1s descShow 2 alternate');
			var index = swiper.realIndex;
			$('.big-img-box #imgDesc'+(index+1)).removeClass('text-for-image');
			$('.big-img-box #imgDesc'+(index-1)).removeClass('text-for-image');
			$('.big-img-box #imgDesc'+index).addClass('text-for-image');
		}
	});
	ptSwiper.stopAutoplay();
	$('.big-img-box').addClass('hidden');
	// document.body.addEventListener('touchstart', musicInBrowserHandler);
})

function putSave() {
	if (-1 === haveChgd.indexOf('photo-image')) {
		savePhoto($('#editPhoto .modal-header #photo-id').text());
	} else {
		uploader.start();
	}
}
var haveChgd = new Array();
function savePhoto(photoId) {
	var data = {Id:photoId}//new Object();
	if (0 == photoId) {
		var regRet = window.location.search.match(/suffix=([^&]+)/);
		data.Suffix = regRet[1];
	}
	var dom = haveChgd.pop();
	while (undefined !== dom) {
		switch (dom) {
			case 'photo-time': {
				data.Time = $('#editPhoto #photo-time').val();
				break;
			}
			case 'photo-address': {
				data.Address = $('#editPhoto #photo-address').val();
				break;
			}
			case 'photo-title': {
				data.Title = $('#editPhoto #photo-title').val();
				break;
			}
			case 'photo-image': {
				data.Image = $('#editPhoto #photo-image img').attr('src');
				break;
			}
			case 'photo-desc': {
				data.Desc = $('#editPhoto #photo-desc').val();
				break;
			}
			default: {
				break;
			}
		}
		dom = haveChgd.pop();
	}

	$.ajax({
		url: '/photo/msg/photo-save',
		contentType: 'application/json',
		data: JSON.stringify(data),
		type: 'post',
		dataType: 'json',
		success:function(data) {
			if (data.Result)
				window.location.reload();
		}
	});
}
function musicPlay(isPlay) {
	var audio = document.getElementById('musicId');
	if (isPlay && audio.paused) {
		audio.play();
		$('#audioPlay .glyphicon-play').removeClass('show').addClass('hidden');
		$('#audioPlay .glyphicon-pause').removeClass('hidden').addClass('show');
	}
	if (!isPlay && !audio.paused) {
		audio.pause();
		$('#audioPlay .glyphicon-pause').removeClass('show').addClass('hidden');
		$('#audioPlay .glyphicon-play').removeClass('hidden').addClass('show');
	}
}
function musicInBrowserHandler() {
	musicPlay(true);
	ptSwiper.startAutoplay();
	document.body.removeEventListener('touchstart', musicInBrowserHandler);
}
function startPhoto() {
	$('.photo-cover').addClass('hidden');
	$('.big-img-box').removeClass('hidden');
	musicPlay(true);
	ptSwiper.startAutoplay();
}
