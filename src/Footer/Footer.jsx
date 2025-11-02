import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>© {currentYear} ChinaTravel</p>
    </footer>
  );
}

export default Footer;
