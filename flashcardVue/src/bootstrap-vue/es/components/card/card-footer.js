function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { mergeData, prefixPropName, copyProps } from '../../utils';
import { assign } from '../../utils/object';
import { cardMixin } from '../../mixins';

export var props = assign({}, copyProps(cardMixin.props, prefixPropName.bind(null, 'footer')), {
  footer: {
    type: String,
    default: null
  },
  footerClass: {
    type: [String, Object, Array],
    default: null
  }
});

export default {
  functional: true,
  props: props,
  render: function render(h, _ref) {
    var _ref2;

    var props = _ref.props,
        data = _ref.data,
        slots = _ref.slots;

    return h(props.footerTag, mergeData(data, {
      staticClass: 'card-footer',
      class: [props.footerClass, (_ref2 = {}, _defineProperty(_ref2, 'bg-' + props.footerBgVariant, Boolean(props.footerBgVariant)), _defineProperty(_ref2, 'border-' + props.footerBorderVariant, Boolean(props.footerBorderVariant)), _defineProperty(_ref2, 'text-' + props.footerTextVariant, Boolean(props.footerTextVariant)), _ref2)]
    }), slots().default || [h('div', { domProps: { innerHTML: props.footer } })]);
  }
};