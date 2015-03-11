define([
  'jquery', 'backbone', 'underscore-plus', 'moment', 'base.app',

  'text!./templates/items.utpl'
],
function(
  $, Backbone, _, moment, app,

  items_template
){
  return Backbone.View.extend({
    initialize: function() {
      this.load();
    },

    load: function() {
      this.fetch({
        success: $.proxy(this.render, this)
      });
    },

    fetch: function(cbs) {
      this.model.fetchOrderItemOptions(cbs);
    },

    render: function() {
      this.$el.html(this.template({order: this.model, moment: moment}));
    },

    template: _.template(items_template),
    events:{
      'change [data-type="field"]': '_changeValue',
      'change [data-field="is_total_price_calculated"]': '_changeAuto',
      'change [data-field="is_taxable"]': '_changeTaxable',
      'click [data-action="add"]': '_addItem',
      'click [data-action="delete-item"]': '_deleteItem',

      'change [data-type="item-option-field"]': '_changeOptionValue',
      'click [data-action="add-item-option"]': '_addItemOption',
      'click [data-action="delete-item-option"]': '_deleteItemOption',

      'click [data-action="save"]': '_clickSave'
    },
    deleted_items: [],
    deleted_item_options: [],

    _addItem: function() {
      this.model.items.add((new Models.OrderItem({ 
        'order_token': this.model.get('access_token') 
      })));
      this.render();
    },

    _deleteItem: function(evt) {
      var btn = $(evt.currentTarget);
      var item_id = btn.closest('[data-type="item-row"]').data('cid');
      var item = _.findWhere(this.model.items.models,{ cid : item_id });
      this.model.items.remove(item);
      this.deleted_items.push(item);
      this.render();
    },

    _changeValue: function(evt) {
      var field = $(evt.currentTarget);
      var item_id = field.closest('[data-type="item-row"]').data('cid');
      var item = _.findWhere(this.model.items.models,{ cid : item_id });
      item.set(field.attr('data-key'), field.val());
    },

    _changeAuto: function(evt) {
      var field = $(evt.currentTarget);
      var item_id = field.closest('[data-type="item-row"]').data('cid');
      var item = _.findWhere(this.model.items.models,{ cid : item_id });
      item.set('is_total_price_calculated', field.prop('checked'));
    },

    _changeTaxable: function(evt) {
      var field = $(evt.currentTarget);
      var item_id = field.closest('[data-type="item-row"]').data('cid');
      var item = _.findWhere(this.model.items.models,{ cid : item_id });
      item.set('is_taxable', field.prop('checked'));
    },

    _changeOptionValue: function(evt) {
      var field = $(evt.currentTarget);
      var cid = field.closest('[data-type="item-option-row"]').data('cid');
      var item_option = _.findWhere(this.model.order_item_options.models,{ cid : cid });
      item_option.set(field.attr('data-key'), field.val());
    },

    _addItemOption: function(evt) {
      var item_cid = $(evt.currentTarget).closest('[data-type="item-row"]').data('cid');
      var item = _.findWhere(this.model.items.models, { cid : item_cid });
      var item_option = new Models.OrderItemOption({ 'order_item': item.id });

      item_option.item = item;
      this.model.order_item_options.add(item_option);
      this.render();
    },

    _deleteItemOption: function(evt) {
      var btn = $(evt.currentTarget);
      var cid = btn.closest('[data-type="item-option-row"]').data('cid');
      var item_option = _.findWhere(this.model.order_item_options.models, { cid : cid });
      this.model.order_item_options.remove(item_option);
      this.deleted_item_options.push(item_option);
      this.render();
    },

    _clickSave: function(evt) {
      var view = this;

      var save_item_fns = view.model.items.map(function(item){
        return function(cbs) {
          item.setFilters({ 'form': 'admin' });
          item.save({}, cbs);
        };
      });

      var delete_item_fns = _.map(view.deleted_items, function(item) {
        return function(cbs) {
          item.setFilters({ 'form': 'admin' });
          item.destroy($.extend({}, cbs, {
            success: function() {
              view.deleted_items = _.without(view.deleted_items, item);
              _.succeed(cbs);
            }
          }));
        };
      });

      var save_item_option_fbs = view.model.order_item_options.map(function(item_option){
        return function(cbs) {
          item_option.setFilters({ 'form': 'admin' });
          if (item_option.item.id && !item_option.item.id) {
            view.model.order_item_options.remove(item_option);
            return _.finish(cbs);
          }
          item_option.save({}, cbs);
        };
      });

      var delete_item_option_fns = _.map(view.deleted_item_options, function(item_option) {
        return function(cbs) {
          //item_option.setFilters({ 'form': 'admin' });
          item_option.setFilters({ 'form': 'admin' });
          item_option.destroy($.extend({}, cbs, {
            success: function() {
              view.deleted_item_options = _.without(view.deleted_item_options, item_option);
              _.succeed(cbs);
            }
          }));
        };
      });

      var btn = $(evt.currentTarget).button('loading');
      _.crunch({
        pre: save_item_fns.concat(delete_item_fns),
        post: {
          pre: save_item_option_fbs.concat(delete_item_option_fns),
          post: function(cbs) {
            view.model.setFilters({ 'form': 'admin' });
            view.model.fetch(cbs);
          }
        }
      }) ({
        success: function() {
          btn.button('reset');
          view.render();            
        },
        error: function() {
          alert('There has been an error. Please check the fields');
          btn.button('reset');          
        }
      });
    }
  });
});