import Ember from 'ember';
import posts from '../data/posts';

var PostRoute = Ember.Route.extend({
  model: function(params) {
    return posts.findBy('id', params.post_id);
  }
});

export default PostRoute;
