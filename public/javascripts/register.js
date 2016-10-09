function check() {
	$('input').each(function() {
		if ($(this).val()==='') {
			alert('请完整填写')
			return false
		}
	})

	if ($('input').eq(5).val()!=$('input').eq(6).val()) {
		alert('密码不一致')
		return false
	}
	
	return true
}