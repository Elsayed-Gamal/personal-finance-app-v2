function Message({ children, type = "info" }) {
  const baseClasses = "p-4 my-4 rounded-lg text-center";

  const typeClasses = {
    error: "bg-red/10 text-red",
    success: "bg-green/10 text-green",
    info: "bg-blue/10 text-blue",
  };

  const finalClasses = `${baseClasses} ${typeClasses[type]}`;

  if (!children) {
    return null;
  }

  return <div className={finalClasses}>{children}</div>;
}

export default Message;
