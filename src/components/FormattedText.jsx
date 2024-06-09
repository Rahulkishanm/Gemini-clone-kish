import React from 'react';
import Markdown from 'react-markdown'

function FormattedText({ text }) {
  return (
    // <div dangerouslySetInnerHTML={{ __html: formattedText }} />
    <Markdown>{text}</Markdown>
  );
}

export default FormattedText;
