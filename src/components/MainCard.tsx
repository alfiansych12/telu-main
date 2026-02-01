'use client';

import { forwardRef, CSSProperties, ReactNode, Ref, ReactElement } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Card, { CardProps } from '@mui/material/Card';
import CardContent, { CardContentProps } from '@mui/material/CardContent';
import CardHeader, { CardHeaderProps } from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// project-imports


// types
import { KeyedObject } from 'types/root';
import Highlighter from './third-party/Highlighter';

// header style
const headerSX = { p: 2.5, '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' } };

export interface MainCardProps extends KeyedObject {
  border?: boolean;
  boxShadow?: boolean;
  children?: ReactElement;
  subheader?: ReactElement | string;
  style?: CSSProperties;
  content?: boolean;
  contentSX?: CardContentProps['sx'];
  darkTitle?: boolean;
  divider?: boolean;
  sx?: CardProps['sx'];
  secondary?: CardHeaderProps['action'];
  shadow?: string;
  elevation?: number;
  title?: ReactNode | string;
  codeHighlight?: boolean;
  codeString?: string;
  modal?: boolean;
  className?: string; // Added className prop
}

// ==============================|| CUSTOM - MAIN CARD ||============================== //

function MainCard(
  {
    border = true,
    boxShadow = true,
    children,
    subheader,
    content = true,
    contentSX = {},
    darkTitle,
    divider = true,
    elevation,
    secondary,
    shadow,
    sx = {},
    title,
    codeHighlight = false,
    codeString,
    modal = false,
    className, // Destructure className
    ...others
  }: MainCardProps,
  ref: Ref<HTMLDivElement>
) {
  const theme = useTheme();


  return (
    <Card
      elevation={elevation || 0}
      ref={ref}
      className={className} // Apply className to Card
      {...others}
      sx={{
        position: 'relative',
        border: border ? '1px solid' : 'none',
        borderRadius: 2,
        borderColor: theme.palette.divider,
        // Enhanced shadow box with multiple layers
        boxShadow: shadow
          ? shadow
          : boxShadow
            ? `0 2px 8px -2px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)'}, 
               0 4px 16px -4px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'}, 
               0 8px 32px -8px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)'}`
            : 'none',
        // Subtle gradient background for depth
        background: boxShadow
          ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.02)'
            : 'rgba(0,0,0,0.01)'
          } 100%)`
          : theme.palette.background.paper,
        // Smooth transitions
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        // Hover effects for interactive cards
        ...(!modal && boxShadow && {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: boxShadow
              ? `0 4px 16px -2px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)'}, 
                 0 8px 32px -4px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}, 
                 0 16px 48px -8px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}, 
                 0 0 0 1px ${theme.palette.primary.main}20`
              : 'none',
            borderColor: theme.palette.primary.main + '40',
          }
        }),
        // Code highlight styles
        ...(codeHighlight && {
          '& pre': {
            m: 0,
            p: '12px !important',
            fontFamily: theme.typography.fontFamily,
            fontSize: '0.75rem'
          }
        }),
        // Modal positioning
        ...(modal && {
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: `calc( 100% - 50px)`, sm: 'auto' },
          '& .MuiCardContent-root': {
            overflowY: 'auto',
            minHeight: 'auto',
            maxHeight: `calc(100vh - 200px)`
          }
        }),
        // Custom sx overrides
        ...sx
      }}
    >
      {/* card header and action */}
      {!darkTitle && title && (
        <CardHeader sx={headerSX} titleTypographyProps={{ variant: 'subtitle1' }} title={title} action={secondary} subheader={subheader} />
      )}
      {darkTitle && title && <CardHeader sx={headerSX} title={<Typography variant="h4">{title}</Typography>} action={secondary} />}

      {/* content & header divider */}
      {title && divider && <Divider />}

      {/* card content */}
      {content && <CardContent sx={contentSX}>{children}</CardContent>}
      {!content && children}

      {/* card footer - clipboard & highlighter  */}
      {codeString && (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Highlighter codeString={codeString} codeHighlight={codeHighlight} />
        </>
      )}
    </Card>
  );
}

export default forwardRef(MainCard);
