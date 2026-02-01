'use client';

import { useState, useRef, useCallback } from 'react';
import { CircularProgress, IconButton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { CloseCircle, SearchNormal1 } from 'iconsax-react';
import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';
import debounce from 'lodash.debounce';
import Eng from 'utils/locales/en.json';
import Id from 'utils/locales/id.json';
import { FlattenedPageType, NavItemType } from 'types/menu';
import useConfig from 'hooks/useConfig';
import getMenuByRole from 'menu-items';
import useUser from 'hooks/useUser';

const flattenPages = (pages: NavItemType[], lang: string): FlattenedPageType[] => {
  const labelMenu: { [key: string]: any } = lang === 'en' ? Eng : Id;
  const flatArray: FlattenedPageType[] = [];

  const recurse = (items: NavItemType[]) => {
    items.forEach((item) => {
      if (item.type === 'item') {
        flatArray.push({
          id: item.id!,
          label: (labelMenu as any)[item.id!] || item.id!,
          url: item.url
        });
      }
      if (item.children) {
        recurse(item.children);
      }
    });
  };

  recurse(pages);
  return flatArray;
};

const Search = () => {
  const { i18n } = useConfig();
  const user = useUser();
  const menuItems = getMenuByRole(user ? user.role : 'admin');

  const allMenusEng = flattenPages(menuItems.items, 'en');
  const allMenusId = flattenPages(menuItems.items, 'id');

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMenu, setFilteredMenu] = useState<FlattenedPageType[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleMenuClick = (url: string) => {
    router.push(url);
    setSearchTerm('');
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      const activeMenu = i18n === 'en' ? allMenusEng : allMenusId;
      const filtered = activeMenu.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()));
      setFilteredMenu(filtered);
      setLoading(false);
    }, 500),
    [i18n, allMenusEng, allMenusId]
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLoading(true);
    setSearchTerm(value);
    if (value) {
      debouncedSearch(value);
    } else {
      setFilteredMenu([]);
      setLoading(false);
    }
  };

  useHotkeys('ctrl+k', (event) => {
    event.preventDefault();
    inputRef.current?.focus();
  });

  return (
    <Box sx={{ position: 'relative', mx: 2, mb: 2 }}>
      <FormControl sx={{ width: 1 }}>
        <OutlinedInput
          id="header-search"
          value={searchTerm}
          onChange={handleSearch}
          inputRef={inputRef}
          startAdornment={
            <InputAdornment position="start" sx={{ mr: -0.2 }}>
              <SearchNormal1 size={14} />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              {searchTerm && (
                <IconButton aria-label="clear search" onClick={() => setSearchTerm('')} edge="end" size="small">
                  <CloseCircle fontSize="small" />
                </IconButton>
              )}
              <Typography variant="subtitle2" sx={{ mr: 1 }}>
                Ctrl + K
              </Typography>
            </InputAdornment>
          }
          aria-describedby="header-search-text"
          placeholder="Search"
          sx={{ '& .MuiOutlinedInput-input': { p: 1 } }}
        />
      </FormControl>

      {searchTerm && (
        <Box
          sx={{
            position: 'absolute',
            top: 45,
            left: 0,
            width: 1,
            bgcolor: 'background.paper',
            zIndex: 10,
            borderRadius: '8px',
            boxShadow: 3,
            maxHeight: 300,
            overflowY: 'auto'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List dense={true}>
              {filteredMenu.length > 0 ? (
                filteredMenu.map((item) => (
                  <ListItem key={item.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleMenuClick(item.url!)}
                      sx={{
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' }
                      }}
                    >
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ p: 2 }}>No result found for "{searchTerm}"</Typography>
              )}
            </List>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Search;
