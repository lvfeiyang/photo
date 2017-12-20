$(function() {
	showModal();

	uploader = getQnUp();

	domBindChg();

	laydate.render({
		elem: '#editPhoto #photo-time',
		done: function(value, date, endDate) {
			if (-1 === haveChgd.indexOf('photo-time'))
				haveChgd.push('photo-time');
		}
	});

	ptSwiper = new Swiper('.swiper-container', {
		direction: 'vertical',
		// loop: true,
		speed: 1000,
		autoplay: {
			delay: 3000,
			stopOnLastSlide: true,
			disableOnInteraction: false,
		},
		// width: window.innerWidth,
		height: window.innerHeight,
		roundLengths: true,
		on: {
			slideChangeTransitionEnd: function() {
				/*var index = swiper.realIndex;
				$('.big-img-box #imgDesc'+(index+1)).removeClass('text-for-image');
				$('.big-img-box #imgDesc'+(index-1)).removeClass('text-for-image');
				$('.big-img-box #imgDesc'+index).addClass('text-for-image');*/
				this.updateProgress();
				if (this.progress >= 0.7 && addingFlag == false) {
					nextPage();
				}
			}
		}
	});
	ptSwiper.autoplay.stop();
	// $('.big-img-box').addClass('hidden');
	// document.body.addEventListener('touchstart', musicInBrowserHandler);
	addingFlag = false;
})

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
	ptSwiper.autoplay.start();
	document.body.removeEventListener('touchstart', musicInBrowserHandler);
}
function startPhoto() {
	$('.photo-cover').addClass('hidden');
	$('.big-img-box').removeClass('hidden');
	musicPlay(true);
	ptSwiper.autoplay.start();
}
function nextPage() {
	addingFlag = true;
	var index = ptSwiper.slides.length;
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
		data: JSON.stringify({Offset: index, Limit: 10, Suffix: suffix}),
		type: 'post',
		dataType: 'json',
		success:function(data) {
			for (var i in data.PhotoList) {
				var v = data.PhotoList[i];
				var addHtml = '<div class="swiper-slide">';
				if ("admin" == user) {
					addHtml += '<button class="btn btn-default" type="button" '+
						'data-toggle="modal" data-target="#editPhoto" data-photo-id='+v.Id+'>修改</button>';
				}
				addHtml += '<div class="one-image"><img src="'+
					v.Image+'?imageView2/2/h/1024" alt="图片丢失了" /><h2 id="imgDesc'+
					index+'" class="text-center">'+v.Desc+'</h2></div></div>';
				ptSwiper.appendSlide(addHtml);
				index++;
			}
			addingFlag = false;
		}
	});
}
