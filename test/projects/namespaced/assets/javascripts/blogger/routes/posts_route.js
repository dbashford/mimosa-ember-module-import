import Ember from 'ember';
import posts from '../data/posts';

var PostsRoute = Ember.Route.extend({
  model: function() {
    return posts;
  }
});

export default PostsRoute;
