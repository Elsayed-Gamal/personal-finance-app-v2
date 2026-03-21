'use client';

import { createContext, useContext } from 'react';

const TableContext = createContext();

function Table({ columns, children }) {
  return (
    <TableContext.Provider value={{ columns }}>
      <div role="table">{children}</div>
    </TableContext.Provider>
  );
}

function Header({ children }) {
  const { columns } = useContext(TableContext);
  return (
    <div
      role="row"
      style={{
        display: 'grid',
        gridTemplateColumns: `${columns}`,
        borderBottom: '1px solid var(--color-gray-100)',
        padding: '12px 16px',
        font: 'var(--text-preset-5)',
        color: 'var(--color-grey-500)',
        marginBottom: '8px',
        // marginTop: "24px",
      }}
    >
      {children}
    </div>
  );
}

function Body({ children }) {
  return <div>{children}</div>;
}

function Row({ children, styles }) {
  const { columns } = useContext(TableContext);
  return (
    <div
      role="row"
      className="border-grey-100 flex items-center border-b border-solid py-4 last:border-0"
      style={{
        display: 'grid',
        gridTemplateColumns: `${columns}`,
        padding: '12px 16px',
        ...styles,
      }}
    >
      {children}
    </div>
  );
}

function Footer({ className, children }) {
  return (
    <div role="row" className={className}>
      {children}
    </div>
  );
}

Table.Header = Header;
Table.Body = Body;
Table.Row = Row;
Table.Footer = Footer;

export default Table;
