async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const futureYear = new Date().getFullYear() + 1;
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const screenshots = 'tests/playwright/screenshots';
  const fixedTimes = ['08:00am', '08:30am', '09:00am', '09:30am', '10:00am', '10:30am', '11:00am', '11:30am', '12:00pm', '12:30pm', '01:00pm', '01:30pm', '02:00pm', '02:30pm', '03:00pm', '03:30pm', '04:00pm'];
  const requestKeys = [];
  const completed = [];
  page.on('request', request => {
    if (request.url().includes('/api/bookings')) requestKeys.push(request.headerValue('idempotency-key'));
  });
  page.on('response', async response => {
    if (response.url().includes('/api/bookings') && [200, 201].includes(response.status())) completed.push(await response.json());
  });

  async function signup(target, name) {
    await target.getByRole('button', { name: 'Booking' }).click();
    await target.getByRole('button', { name: 'Sign up' }).click();
    await target.getByRole('textbox', { name: 'Name' }).fill(name);
    await target.getByRole('textbox', { name: 'Email' }).fill(`${name.replaceAll(' ', '.').toLowerCase()}-${unique}@example.test`);
    await target.getByRole('textbox', { name: /Enter New Password/ }).fill('password1');
    await target.getByRole('checkbox').check();
    await target.getByRole('button', { name: 'Continue' }).click();
    await target.getByRole('heading', { name: 'Customize Your Requirements' }).waitFor();
  }

  async function completeBooking(target, fixed = false) {
    await target.getByRole('button', { name: 'Next', exact: true }).click();
    await target.getByRole('button', { name: 'Next', exact: true }).click();
    if (fixed) await target.getByRole('button', { name: '09:00am', exact: true }).click();
    await target.getByRole('button', { name: 'Next', exact: true }).click();
    await target.getByRole('textbox', { name: 'Address' }).fill('1009 3rd Ave');
    await target.getByRole('button', { name: 'Next', exact: true }).click();
    await target.getByRole('textbox', { name: 'Credit Card' }).fill('4111 1111 1111 1111');
    await target.getByRole('textbox', { name: 'Exp. Date' }).fill(`12/${futureYear}`);
    await target.getByRole('textbox', { name: 'CVV' }).fill('123');
    await target.getByRole('textbox', { name: 'Full Name' }).fill('Browser Customer');
    await target.getByRole('textbox', { name: 'Email Address' }).fill(`customer-${unique}@example.test`);
    await target.getByRole('textbox', { name: 'Phone Number' }).fill('555 123 4567');
    await target.getByRole('button', { name: 'Text', exact: true }).click();
    await target.getByRole('button', { name: 'Place order' }).click();
    await target.getByRole('heading', { name: 'Your appointment was booked.' }).waitFor();
  }

  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('http://localhost:8080/');
  assert(await page.getByRole('button', { name: 'Studio' }).getAttribute('aria-pressed') === 'true', 'Studio must be selected by default.');
  assert(await page.getByRole('combobox', { name: 'Number of rooms' }).inputValue() === '2', 'Two rooms must be selected by default.');
  assert(await page.getByRole('combobox', { name: 'Clean type' }).inputValue() === 'Standard', 'Standard must be selected by default.');
  await page.screenshot({ path: `${screenshots}/home-desktop.png` });
  await page.getByRole('button', { name: 'Booking' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('missing@example.test');
  await page.getByRole('textbox', { name: /Password/ }).fill('password1');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByText('The email or password you entered is incorrect.').waitFor();
  await page.screenshot({ path: `${screenshots}/login-error-desktop.png` });
  await page.getByRole('button', { name: 'Sign up' }).click();
  await page.screenshot({ path: `${screenshots}/signup-desktop.png` });
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByText('You must accept the Terms of Service and Privacy Policy.').waitFor();
  await page.getByRole('textbox', { name: 'Name' }).fill('Alice Browser');
  await page.getByRole('textbox', { name: 'Email' }).fill(`alice-${unique}@example.test`);
  await page.getByRole('textbox', { name: /Enter New Password/ }).fill('password1');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('heading', { name: 'Customize Your Requirements' }).waitFor();
  assert((await page.context().cookies()).some(cookie => cookie.name === 'clean_session'), 'Signup must establish a browser session cookie.');
  await page.screenshot({ path: `${screenshots}/booking-step-1-desktop.png` });
  await page.getByRole('button', { name: '9', exact: true }).click();
  await page.getByRole('button', { name: 'Post Construction' }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  assert(await page.getByRole('button', { name: 'Previous month' }).isDisabled(), 'Past calendar navigation must be disabled.');
  await page.screenshot({ path: `${screenshots}/booking-step-2-desktop.png` });
  await page.getByRole('button', { name: 'Next month' }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('heading', { name: 'Book Timing' }).waitFor();
  assert(await page.getByRole('button', { name: 'Flexible Cleaner will arrive between 09:00am-04:00pm Save $8.10 off' }).getAttribute('aria-pressed') === 'true', 'Flexible must be the default arrival.');
  for (const time of fixedTimes) assert(await page.getByRole('button', { name: time, exact: true }).count() === 1, `Missing or duplicate fixed arrival: ${time}.`);
  await page.getByRole('button', { name: '09:00am', exact: true }).click();
  assert(await page.getByRole('button', { name: 'Flexible Cleaner will arrive between 09:00am-04:00pm Save $8.10 off' }).getAttribute('aria-pressed') === 'false', 'Fixed arrival must deselect Flexible.');
  await page.getByRole('button', { name: 'Flexible Cleaner will arrive between 09:00am-04:00pm Save $8.10 off' }).click();
  await page.screenshot({ path: `${screenshots}/booking-step-3-desktop.png` });
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByText('Address is required.').waitFor();
  await page.getByRole('textbox', { name: 'Address' }).fill('1009 3rd Ave');
  await page.getByRole('button', { name: 'Weekly' }).click();
  await page.getByRole('button', { name: 'Inside oven ($20.00)' }).click();
  await page.screenshot({ path: `${screenshots}/booking-step-4-desktop.png` });
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Place order' }).click();
  await page.getByText('Card number is required.').waitFor();
  await page.getByRole('textbox', { name: 'Discount code' }).fill(' clean10 ');
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.getByText('Promo Discount').waitFor();
  assert(await page.getByText('-$10.00').count() > 0, 'CLEAN10 must apply a $10 promo discount.');
  await page.screenshot({ path: `${screenshots}/booking-step-5-desktop.png` });
  await page.getByRole('textbox', { name: 'Credit Card' }).fill('4111 1111 1111 1111');
  await page.getByRole('textbox', { name: 'Exp. Date' }).fill(`12/${futureYear}`);
  await page.getByRole('textbox', { name: 'CVV' }).fill('123');
  await page.getByRole('textbox', { name: 'Full Name' }).fill('Alice Browser');
  await page.getByRole('textbox', { name: 'Email Address' }).fill(`alice-${unique}@example.test`);
  await page.getByRole('textbox', { name: 'Phone Number' }).fill('555 123 4567');
  await page.getByRole('button', { name: 'Text', exact: true }).click();
  await page.getByRole('button', { name: 'Place order' }).dblclick();
  await page.getByRole('heading', { name: 'Your appointment was booked.' }).waitFor();
  await page.screenshot({ path: `${screenshots}/confirmation-desktop.png` });
  assert(requestKeys.length === 1 && Boolean(requestKeys[0]), 'One Place order action must make one keyed booking request.');
  assert(completed.length === 1, 'Duplicate activation must create exactly one completed booking.');
  assert(!JSON.stringify(completed[0]).includes('4111111111111111') && !JSON.stringify(completed[0]).includes('"cvv"'), 'Completed booking must exclude PAN and CVV.');

  const browser = page.context().browser();
  assert(browser, 'Firefox browser handle is unavailable.');
  const secondContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const second = await secondContext.newPage();
  await second.goto('http://localhost:8080/');
  await signup(second, 'Second Browser');
  await completeBooking(second, true);
  assert(await second.getByText('09:00am').count() === 1, 'A second customer must complete the same fixed arrival without availability changes.');
  await secondContext.close();
}
