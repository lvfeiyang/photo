function showModal() {
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
}
function getQnUp() {
	return Qiniu.uploader({
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
}
function domBindChg() {
	function bindChg() {
		var chgId = $(this).attr('id');
		if (-1 === haveChgd.indexOf(chgId))
			haveChgd.push(chgId);
	}
	$('#editPhoto #photo-time').bind('input propertychange', bindChg);
	$('#editPhoto #photo-address').bind('input propertychange', bindChg);
	$('#editPhoto #photo-title').bind('input propertychange', bindChg);
	$('#editPhoto #photo-desc').bind('input propertychange', bindChg);
}
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
				if ('' == data.Desc && 0 != photoId){
					data.Desc = '!Del';
				}
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
		},
		error:function(jqXHR, textStatus, errorThrown) {
			alert(jqXHR.responseJSON.ErrMsg);
		}
	});
}
