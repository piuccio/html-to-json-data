module.exports = {
  inputs: [
    // Input Type Text
    { type: 'text' },
    { type: 'text' },
    // Input Type Password
    { type: 'text' },
    { type: 'password' },
    // Input Type Submit
    { type: 'text', name: 'firstname', value: 'Mickey' },
    { type: 'text', name: 'lastname', value: 'Mouse' },
    { type: 'submit', value: 'Submit' },
    // Input Type Reset
    { type: 'text', name: 'firstname0', value: 'Mickey' },
    { type: 'text', name: 'lastname0', value: 'Mouse' },
    { type: 'submit', value: 'Submit' },
    { type: 'reset' },
    // Input Type Radio
    { type: 'radio', name: 'gender', value: 'V1' },
    { type: 'radio', name: 'gender', value: 'V2' },
    { type: 'radio', name: 'gender', value: 'V3' },
    // Input Type Checkbox
    { type: 'checkbox', name: 'vehicle1', value: 'Bike' },
    { type: 'checkbox', name: 'vehicle2', value: 'Car' },
    // Input Type Button
    { type: 'button', value: 'Click Me!' },
  ],
};
