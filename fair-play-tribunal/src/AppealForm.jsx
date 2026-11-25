import { createContext, useContext, useId, useState } from 'react'

const FormContext = createContext(null)

function validate(values) {
  const errors = {}
  const wholeNumber = (value) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value))
  if (!wholeNumber(values.current) || Number(values.current) < 1) errors.current = 'Enter a positive whole number.'
  if (!wholeNumber(values.requested)) errors.requested = 'Enter a non-negative whole number.'
  else if (!errors.current && Number(values.requested) >= Number(values.current)) errors.requested = 'Requested suspension must be less than the current suspension.'
  if (!values.reason.trim()) errors.reason = 'Enter a reason for the appeal.'
  return errors
}

function Field({ name, label, multiline = false }) {
  const { values, errors, touched, setValues, setTouched, attempted } = useContext(FormContext)
  const id = useId()
  const error = (touched[name] || attempted) && errors[name]
  const props = {
    id, name, value: values[name],
    onChange: (event) => { setValues((previous) => ({ ...previous, [name]: event.target.value })); setTouched((previous) => ({ ...previous, [name]: true })) },
    onBlur: () => setTouched((previous) => ({ ...previous, [name]: true })),
    'aria-invalid': Boolean(error), 'aria-describedby': error ? `${id}-error` : undefined,
  }
  return <p><label htmlFor={id}>{label}</label><br />{multiline ? <textarea {...props} /> : <input {...props} type="number" min="0" step="1" />}{error && <span id={`${id}-error`}> {error}</span>}</p>
}

export default function AppealForm({ initialDays }) {
  const [values, setValues] = useState({ current: String(initialDays), requested: '', reason: '' })
  const [touched, setTouched] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const errors = validate(values)
  function submit(event) {
    event.preventDefault()
    setAttempted(true)
    if (Object.keys(errors).length === 0) setSubmitted({ ...values, reason: values.reason.trim() })
    else setSubmitted(null)
  }
  return (
    <section aria-labelledby="appeal-heading">
      <h2 id="appeal-heading">Appeal form</h2>
      <FormContext.Provider value={{ values, errors, touched, setValues, setTouched, attempted }}>
        <form noValidate onSubmit={submit}>
          <Field name="current" label="Current suspension (days)" />
          <Field name="requested" label="Requested suspension (days)" />
          <Field name="reason" label="Reason for appeal" multiline />
          <button type="submit">Review appeal</button>
        </form>
      </FormContext.Provider>
      {submitted && <section aria-labelledby="submitted-heading"><h3 id="submitted-heading">Submitted appeal</h3><dl><dt>Current suspension (days)</dt><dd>{submitted.current}</dd><dt>Requested suspension (days)</dt><dd>{submitted.requested}</dd><dt>Reason for appeal</dt><dd>{submitted.reason}</dd></dl></section>}
    </section>
  )
}
