import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import './style.scss';

/* FormPopup can be used in 2 ways:
 *
 * 1. Wrapping the trigger element with FormPopup, for example:
 *    <FormPopup>
 *      <button>Display Form</button>
 *    </FormPopup>
 *    When doing this, the form popup will automatically be displayed when the trigger element is clicked.
 *
 * 2. If you want more manual control over when it's displayed, you can specify
 *    the `overrideShow` prop, in which case the popup will be displayed if and only if
 *    `overrideShow` is `true`. In this case, the trigger element is unneccessary (i.e. <FormPopup />)
 * 
 * 
 * In either case, the actual form component itself should be provided through the `form` prop. Let's
 * refer to it as Form to emphasize that it's a component. Form can also be used in 2 ways:
 * 
 * 1. Form will be provided the props `onSubmit` and `onCancel`. These props can be used by Form to
 *    indicate submission and cancellation respectively. In this case, FormPopup will automatically
 *    close the popup after submission/cancellation as well as call it's own `onSubmit` and `onCancel` props.
 *    So the `onSubmit` handler for FormPopup should be where the results of the form are used.
 *    Example:
 *      <FormPopup form={SomeImportedForm} onSubmit={values => alert(`Hi ${value.name}!`)} > ... </FormPopup>
 *    Also note that `onSubmit` can return a promise, in which case FormPopup will wait for that promise
 *    to resolve before closing the popup
 * 
 * 2. Instead of calling `onSubmit` and `onCancel`, Form itself can handle what to do using the results
 *    of the form. In this case, the component using FormPopup is never able to receive the form values
 *    Example:
 *      const Form = () => {... return <form onSubmit={() => processResults()}> <input name="city" /> </form> ... }
 *      <FormPopup form={Form} onSubmit={() => "This never gets called"} />
 *    Note that it may be desirable to still call the props `onSubmit` and `onCancel` in Form, even if
 *    you don't actually pass it any values so that FormPopup can automatically close the popup after submit/cancel.
 *    Otherwise, the only way to close the popup is by clicking outside.
 * 
 * Or in some cases, it may be appropriate to use a combination of both the above approaches.
 * For example, if you have a Form being used by multiple different components, there may be some functionality
 * with the results that applies to all uses of Form, and other functionality that depends on where it's being used.
 * 
 * All other props will be passed on to the Form.
 */
// TODO: Refactor all form popups to use this

const ModalPopup = ({ children }) => {
  // the following uses React Portals to place the popup directly in body rather than in the current component tree
  const popupRootRef = useRef(document.createElement('div'));

  useEffect(() => {
    const popupRoot = popupRootRef.current;
    popupRoot.tabIndex = '-1';

    document.body.appendChild(popupRoot);
    popupRoot.focus();
    return () => document.body.removeChild(popupRoot);
  }, []);

  return ReactDOM.createPortal(children, popupRootRef.current);
};

const FormPopup = ({ form, children, onSubmit, onCancel, overrideShow, ...props }) => {
  const [show, setShow] = useState(false);
  const popupContent = useRef(null);

  useEffect(() => {
    if (overrideShow !== undefined) {
      setShow(overrideShow);
    }
  }, [overrideShow]);

  useEffect(() => {
    if (show && popupContent.current) {
      popupContent.current.focus();
    }
  }, [show]);

  // only set show if overrideShow isn't specified
  const maybeSetShow = value => {
    if (overrideShow === undefined) {
      setShow(value);
    }
  };

  const submit = async values => {
    if (onSubmit) {
      // TODO: if onSubmit is a promise, display loading indication until promise resolves before closing popup
      await onSubmit(values);
    }
    maybeSetShow(false);
  };

  const cancel = async () => {
    if (onCancel) {
      await onCancel();
    }
    maybeSetShow(false);
  };

  const handleKeyUp = e => {
    if (e.key === 'Escape') {
      cancel();
    }
  };

  const CustomForm = form;
  const childrenWithClickListener = children && React.cloneElement(children, { onClick: () => maybeSetShow(true) });
  return (
    <>
      {childrenWithClickListener}

      {show && (
        <ModalPopup>
          <div className="form-popup" onClick={cancel} onKeyUp={handleKeyUp}>
            <div className="popup-content" onClick={e => e.stopPropagation()} tabIndex={-1} ref={popupContent}>
              <CustomForm onSubmit={submit} onCancel={cancel} {...props} />
            </div>
          </div>
        </ModalPopup>
      )}
    </>
  );
};

export default FormPopup;
