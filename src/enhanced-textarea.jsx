const React = require('react');
const StylePropable = require('./mixins/style-propable');
const AutoPrefix = require('./styles/auto-prefix');

const rowsHeight = 24;

const styles = {
  textarea: {
    width: '100%',
    resize: 'none',
    font: 'inherit',
    padding: 0,
  },
  shadow: {
    width: '100%',
    resize: 'none',
    // Overflow also needed to here to remove the extra row
    // added to textareas in Firefox.
    overflow: 'hidden',
    font: 'inherit',
    padding: 0,
    position: 'absolute',
    opacity: 0,
  },
};

const EnhancedTextarea = React.createClass({

  mixins: [StylePropable],

  propTypes: {
    onChange: React.PropTypes.func,
    onHeightChange: React.PropTypes.func,
    textareaStyle: React.PropTypes.object,
    rows: React.PropTypes.number,
    rowsMax: React.PropTypes.number,
  },

  getDefaultProps() {
    return {
      rows: 1,
    };
  },

  getInitialState() {
    return {
      height: this.props.rows * rowsHeight,
    };
  },

  componentDidMount() {
    this._syncHeightWithShadow();
  },

  render() {
    let {
      onChange,
      onHeightChange,
      rows,
      style,
      textareaStyle,
      valueLink,
      ...other,
    } = this.props;

    const textareaStyles = this.mergeAndPrefix(styles.textarea, textareaStyle, {
      height: this.state.height,
    });

    const shadowStyles = this.mergeAndPrefix(styles.shadow);

    if (this.props.hasOwnProperty('valueLink')) {
      other.value = this.props.valueLink.value;
    }

    if (this.props.disabled) {
      style.cursor = 'default';
    }

    return (
      <div style={this.props.style}>
        <textarea
          ref="shadow"
          style={AutoPrefix.all(shadowStyles)}
          tabIndex="-1"
          rows={this.props.rows}
          defaultValue={this.props.defaultValue}
          readOnly={true}
          value={this.props.value}
          valueLink={this.props.valueLink} />
        <textarea
          {...other}
          ref="input"
          rows={this.props.rows}
          style={AutoPrefix.all(textareaStyles)}
          onChange={this._handleChange} />
      </div>
    );
  },

  getInputNode() {
    return React.findDOMNode(this.refs.input);
  },

  setValue(value) {
    this.getInputNode().value = value;
    this._syncHeightWithShadow(value);
  },

  _syncHeightWithShadow(newValue, e) {
    let shadow = React.findDOMNode(this.refs.shadow);

    if (newValue !== undefined) {
      shadow.value = newValue;
    }

    let newHeight = shadow.scrollHeight;

    if (this.props.rowsMax > this.props.rows) {
      newHeight = Math.min(this.props.rowsMax * rowsHeight, newHeight);
    }

    newHeight = Math.max(newHeight, rowsHeight);

    if (this.state.height !== newHeight) {
      this.setState({
        height: newHeight,
      });

      if (this.props.onHeightChange) {
        this.props.onHeightChange(e, newHeight);
      }
    }
  },

  _handleChange(e) {
    this._syncHeightWithShadow(e.target.value);

    if (this.props.hasOwnProperty('valueLink')) {
      this.props.valueLink.requestChange(e.target.value);
    }

    if (this.props.onChange) {
      this.props.onChange(e);
    }
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this._syncHeightWithShadow(nextProps.value);
    }
  },
});

module.exports = EnhancedTextarea;
