$( document ).ready(function() {
	var client =  '8G8fsk9mfuf4fHzPEYBBlUmkn7YxjurKyeFVCUKFqtTWLLnntE';
	var urlTumblr = 'benhhopkins.tumblr.com';
	 
	$.ajax({
		 // creating the url to access the endpoing. The variable with the blog
		 // url goes once more under regex to make sure no character is being pass
		 // that might stop the ajax call
		 url: 'https://api.tumblr.com/v2/blog/' + urlTumblr + '/posts',
		 method: 'get',
		 // make sure to use jsonp. It is a requirement to consume the Tumblr api
		 dataType: "jsonp",
		 data: ({ api_key: client}),
		 // upon sucess exceute the following code
		 success: function(data){
				 console.log(data);
				 
				 // check if  input is returning object with data
				 if((data.response).length === 0){
					 $('#tumblr_posts').html('No data returned from Tumblr.');
					 } else {
				
				// variables to access the object returned
				var objectBlog = data.response.blog;
				var objectPosts = data.response.posts;
				
				// each loop to go through all the post
				$.each(objectPosts, function(key, value){
					$('#tumblr_posts').append('<div class="tumblr_post" id="' + key + '">');
					if(value.type === "photo"){
						// inner each loop to go through all the photos for each post
						$.each(value.photos, function(k, v){
								//append image
								$('#' + key).append(
									'<img src="' + v.original_size.url + '" />'
								);
							});// end inner each
						
						// caption for each post
						$('#' + key).append('<p class="tumblr_text">' + value.caption + '</p>');
					}
					else if(value.type === "text"){
						$('#' + key).append('<p class="tumblr_title">' + value.title + '</p>');
						$('#' + key).append('<p class="tumblr_text">' + value.body + '</p>');
					}
					$('#tumblr_posts').append('</div>');
					});// end each
			 } // end success function
		 }
	 }); // end ajax call
});