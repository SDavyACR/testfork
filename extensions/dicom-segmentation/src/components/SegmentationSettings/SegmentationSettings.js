import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Range } from '@ohif/ui';

import './SegmentationSettings.css';

const SegmentationSettings = ({ configuration, onBack, onChange, servicesManager, disabledFields = [] }) => {
  const [state, setState] = useState({
    renderFill: configuration.renderFill,
    renderOutline: configuration.renderOutline,
    shouldRenderInactiveLabelmaps: configuration.shouldRenderInactiveLabelmaps,
    fillAlpha: configuration.fillAlpha,
    outlineAlpha: configuration.outlineAlpha,
    outlineWidth: configuration.outlineWidth,
    fillAlphaInactive: configuration.fillAlphaInactive,
    outlineAlphaInactive: configuration.outlineAlphaInactive,
    segsTolerance: configuration.segsTolerance,
  });

  useEffect(() => {
    onChange(state);
  }, [state]);

  const check = field => {
    setState(state => ({ ...state, [field]: !state[field] }));
  };

  const save = (field, value) => {
    setState(state => ({ ...state, [field]: value }));
  };

  const once = fn => (...args) => {
    if (!fn) return;
    fn(...args);
    fn = null;
  };

  const segTolValue = document.getElementById('segToleranceValue');
  if (segTolValue) {
    segTolValue.onchange = once(function() {
      const { UINotificationService, LoggerService } = servicesManager.services;

      const error = new Error(
        'Segmentation loader tolerance changed.\
        This operation can potentially generate errors in the Segmentation parsing.'
      );

      LoggerService.error({ error, message: error.message });
      UINotificationService.show({
        title: 'Segmentation panel',
        message: error.message,
        type: 'warning',
        autoClose: true,
      });
  });
}

  const toFloat = value => parseFloat(value / 100).toFixed(2);

  return (
    <div className="dcmseg-segmentation-settings">
      <div className="settings-title">
        <h3>Segmentations Settings</h3>
        <button className="return-button" onClick={onBack}>
          Back
        </button>
      </div>
      <div
        className="settings-group"
        style={{ marginBottom: state.renderFill ? 15 : 0 }}
      >
        <CustomCheck
          label="Segment Fill"
          checked={state.renderFill}
          onChange={() => check('renderFill')}
        />
        {state.renderFill && (
          <CustomRange
            label="Opacity"
            step={1}
            min={0}
            max={100}
            value={state.fillAlpha * 100}
            onChange={event => save('fillAlpha', toFloat(event.target.value))}
            showPercentage
          />
        )}
      </div>
      <div
        className="settings-group"
        style={{ marginBottom: state.renderOutline ? 15 : 0 }}
      >
        <CustomCheck
          label="Segment Outline"
          checked={state.renderOutline}
          onChange={() => check('renderOutline')}
        />
        {state.renderOutline && (
          <>
            {!disabledFields.includes('outlineAlpha') && (
              <CustomRange
                value={state.outlineAlpha * 100}
                label="Opacity"
                showPercentage
                step={1}
                min={0}
                max={100}
                onChange={event => save('outlineAlpha', toFloat(event.target.value))}
              />
            )}
            {!disabledFields.includes('outlineWidth') && (
              <CustomRange
                value={state.outlineWidth}
                label="Width"
                showValue
                step={1}
                min={0}
                max={5}
                onChange={event => save('outlineWidth', parseInt(event.target.value))}
              />
            )}
          </>
        )}
      </div>
      {(state.renderFill || state.renderOutline) && !disabledFields.includes('shouldRenderInactiveLabelmaps') && (
        <div
          className="settings-group"
          style={{ marginBottom: state.shouldRenderInactiveLabelmaps ? 15 : 0 }}
        >
          <CustomCheck
            label="Render inactive segmentations"
            checked={state.shouldRenderInactiveLabelmaps}
            onChange={() => check('shouldRenderInactiveLabelmaps')}
          />
          {state.shouldRenderInactiveLabelmaps && (
            <>
              {state.renderFill && !disabledFields.includes('fillAlphaInactive') && (
                <CustomRange
                  label="Fill Opacity"
                  showPercentage
                  step={1}
                  min={0}
                  max={100}
                  value={state.fillAlphaInactive * 100}
                  onChange={event => save('fillAlphaInactive', toFloat(event.target.value))}
                />
              )}
              {state.renderOutline && !disabledFields.includes('outlineAlphaInactive') && (
                <CustomRange
                  label="Outline Opacity"
                  showPercentage
                  step={1}
                  min={0}
                  max={100}
                  value={state.outlineAlphaInactive * 100}
                  onChange={event => save('outlineAlphaInactive', toFloat(event.target.value))}
                />
              )}
            </>
          )}
        </div>
      )}
      <div className="settings-group" style={{ marginBottom: 15 }}>
        <label style={{ margin: '0 15px' }}>
          Tolerance:
          <input
            id="segToleranceValue"
            style={{ margin: '0 15px' }}
            label="Tolerance"
            onKeyPress={event => {
                const validate = string => {
                  let rgx = /[^-.e0-9]+/g;
                  return string.match(rgx);
                };

                if (validate(event.key)) {
                  event.preventDefault();
                }
              }
            }
            onChange={event => {
              save('segsTolerance', event.target.value);
            }}
            value={state.segsTolerance}
          />
        </label>
      </div>
    </div>
  );
};

const CustomCheck = ({ label, checked, onChange }) => {
  return (
    <div className="custom-check">
      <label>
        <span>{label}</span>
        <input type="checkbox" checked={checked} onChange={onChange} />
      </label>
    </div>
  );
};

const CustomRange = props => {
  const { label, onChange } = props;
  return (
    <div className="range">
      <label htmlFor="range">{label}</label>
      <Range
        {...props}
        onChange={event => {
          event.persist();
          onChange(event);
        }}
      />
    </div>
  );
};

SegmentationSettings.propTypes = {
  configuration: PropTypes.shape({
    renderFill: PropTypes.bool.isRequired,
    renderOutline: PropTypes.bool.isRequired,
    shouldRenderInactiveLabelmaps: PropTypes.bool.isRequired,
    fillAlpha: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    outlineAlpha: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    outlineWidth: PropTypes.number.isRequired,
    fillAlphaInactive: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    outlineAlphaInactive: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    segsTolerance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SegmentationSettings;
