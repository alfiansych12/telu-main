// MATERIAL - UI
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// THIRD - PARTY
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark, a11yLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// TYPES
import { ThemeMode } from 'types/config';

// ==============================|| CODE HIGHLIGHTER ||============================== //

export default function SyntaxHighlight({ children, ...others }: { children: string }) {
  const theme = useTheme();

  return (
    <Box sx={{ borderRadius: '0px 0px 8px 8px', overflow: 'hidden' }}>
      <SyntaxHighlighter
        language="javascript"
        showLineNumbers
        style={theme.palette.mode === ThemeMode.DARK ? a11yLight : a11yDark}
        {...others}
      >
        {children}
      </SyntaxHighlighter>
    </Box>
  );
}
