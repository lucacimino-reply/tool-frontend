import { useState } from 'react';
import { ContactsPage } from './features/contacts/ContactsPage';

function App() {
  // The following Delivery unit consumes this transition boundary to render confirmation.
  const [, setSubmissionSucceeded] = useState(false);

  return <ContactsPage onSubmissionSuccess={() => setSubmissionSucceeded(true)} />;
}

export default App;
