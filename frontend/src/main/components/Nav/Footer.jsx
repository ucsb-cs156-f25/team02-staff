import { Container } from "react-bootstrap";
import { useSystemInfo } from "main/utils/systemInfo";

export default function Footer() {
  const { data: systemInfo } = useSystemInfo();
  return (
    <footer className="bg-light pt-3 pt-md-4 pb-4 pb-md-5" data-testid="Footer">
      <Container>
        <p>
          This is a sample webapp using React with a Spring Boot backend.
          {systemInfo.sourceRepo ? (
            <span data-testid="footer-see-source-code">
              {" "}
              See the source code on{" "}
              <a
                href={`${systemInfo.sourceRepo}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Github.
              </a>
            </span>
          ) : (
            <span data-testid="footer-see-source-code" />
          )}
        </p>
      </Container>
    </footer>
  );
}
