'use client';

import Message from './_UI/Message';

function ErrorPage({ error }) {
  return <Message type="error">{error.message}</Message>;
}

export default ErrorPage;
