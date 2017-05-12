const NYTBaseUrl = "https://api.nytimes.com/svc/topstories/v2/";
const ApiKey = "baf546982ea94dea96fcc8dcb57da01a"; // replace with NYT API key 
const SECTIONS = "home, arts, automobiles, books, business, fashion, food, health, insider, magazine, movies, national, nyregion, obituaries, opinion, politics, realestate, science, sports, sundayreview, technology, theater, tmagazine, travel, upshot, world";

function buildUrl(section) {
  //return 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/nytimes-api.json';
  return NYTBaseUrl + section + ".json?api-key=" + ApiKey;
}

var XHR = {};
XHR.base = function(callback) {
  var request = new XMLHttpRequest(), callback = callback || function () {};
  request.onreadystatechange = function() {
    if (this.readyState == 4 ) {
      callback(request.response);
    }
  };
  return request;
}
XHR.get = function (url, params, callback) { 
  var request = XHR.base(callback);
  request.open("GET",[url, '?', params].join(''), /*async flag -> */ true); 
  request.send();
}

XHR.post = function(url, data, callback) {
  var request = XHR.base(callback);
  request.open("POST", url, true);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify(data))
}

/*
  var data = { email: "super@admin.com", 
               password: "changeme", 
               device_name: "random iphone", 
               device_uid: "c65056df-79a8-43f8-95f9-7a7f14d11e33" 
             },
             
      url = 'http://localhost:3000/api/v1/sign-in',
      
      callback = function(r) {
                   console.log(JSON.parse(r));
                 }
  XHR.post(url, data, callback);
 */
//patch, put, delete ...etc


Vue.component('news-list', {
  props: ['results'],
  template: `
    <section>
      <div class="row" v-for="posts in processedPosts">
        <div class="columns large-3 medium-6" v-for="post in posts">
          <div class="card">
          <div class="card-divider">
          {{ post.title }}
          </div>
          <a :href="post.url" target="_blank"><img :src="post.image_url"></a>
          <div class="card-section">
            <p>{{ post.abstract }}</p>
          </div>
        </div>
        </div>
      </div>
  </section>
  `,
  computed: {
    processedPosts() {
      let posts = this.results;

      // Add image_url attribute
      posts.map(post => {
        let imgObj = post.multimedia.find(media => media.format === "superJumbo");
        post.image_url = imgObj ? imgObj.url : "http://placehold.it/300x200?text=N/A";
      });

      // Put Array into Chunks
      let i, j, chunkedArray = [],
        chunk = 4;
      for (i = 0, j = 0; i < posts.length; i += chunk, j++) {
        chunkedArray[j] = posts.slice(i, i + chunk);
      }
      return chunkedArray;
    }
  }
});

const vm = new Vue({
  el: '#app',
  data: {
    results: [],
    sections: SECTIONS.split(', '), // create an array of the sections
    section: 'home', // set default section to 'home'
    loading: true,
    title: ''
  },
  mounted() {
    this.getPosts('home');
  },
  methods: {
    getPosts(section) {
      /*
      let url = buildUrl(section);
      axios.get(url).then((response) => {
       console.log(this) 
        this.loading = false;
        this.results = response.data.results;
        let title = this.section !== 'home' ? "Top stories in '" + this.section + "' today" : "Top stories today";
        this.title = title + "(" + response.data.num_results + ")";
      }).catch((error) => {
        console.log(error);
      });
      */
      let that = this;
      XHR.get(NYTBaseUrl + section + '.json' , 'api-key=' + ApiKey, (raw) => {
        var response = {}; 
        response.data = JSON.parse(raw);
        response.num_results = response.data.length;
        //console.log(response.data);
        that.loading = false;
        that.results = response.data.results;
        let title = that.section !== 'home' ? "Top stories in '" + that.section + "' today" : "Top stories today";
        that.title = title + "(" + response.data.num_results + ")";
      })
    }
  }
});
