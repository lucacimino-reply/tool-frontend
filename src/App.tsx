import { useState } from 'react';
import { ContactsPage } from './features/contacts/ContactsPage';
import { SubmissionConfirmation } from './features/contacts/SubmissionConfirmation';

function App() {
  const [submissionSucceeded, setSubmissionSucceeded] = useState(false);

  if (submissionSucceeded) {
    return <SubmissionConfirmation onReturnHome={() => setSubmissionSucceeded(false)} />;
  }

  return <ContactsPage onSubmissionSuccess={() => setSubmissionSucceeded(true)} />;
}

export default App;
