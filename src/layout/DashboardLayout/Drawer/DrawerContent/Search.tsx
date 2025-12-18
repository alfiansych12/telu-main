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
// import allPages from 'menu-items/all-page';
import Eng from 'utils/locales/en.json';
import Id from 'utils/locales/id.json';
import { FlattenedPageType, NavItemType } from 'types/menu';
import useConfig from 'hooks/useConfig';
import getMenuByRole from 'menu-items';
import useUser from 'hooks/useUser';

const flattenPages = (pages: NavItemType[], lang: string): FlattenedPageType[] => {
  const labelMenu: { [key: string]: string } = lang === 'en' ? Eng : Id;
  const flatArray: FlattenedPageType[] = [];

  const recurse = (items: NavItemType[]) => {
    items.forEach((item) => {
      if (item.type === 'item') {
        flatArray.push({
          id: item.id!,
          label: labelMenu[item.id!] || '',
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




const useMenuItems = () => {
  const user = useUser();
  return getMenuByRole(user?.role || 'admin');
};

const Search = () => {
  const { i18n } = useConfig();
  const menuItems = useMenuItems();
  const allMenusEng = flattenPages(menuItems.items, 'en');
  const allMenusId = flattenPages(menuItems.items, 'id');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMenu, setFilteredMenu] = useState<FlattenedPageType[]>(i18n === 'en' ? allMenusEng : allMenusId);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle menu item click
  const handleMenuClick = (url: string) => {
    router.push(url);
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      const activeMenu = i18n === 'en' ? allMenusEng : allMenusId;
      const filtered = activeMenu.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()));
      setFilteredMenu(filtered);
      setLoading(false);
    }, 1000),
    [i18n]
  );

  // Handle input change
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLoading(true);
    setSearchTerm(value);
    debouncedSearch(value);
  const useMenuItems = () => {
    const user = useUser();
    const menuItems = getMenuByRole(user?.role || 'admin');
    return menuItems;
  };
  // Use react-hotkeys-hook to handle Ctrl + K and focus the input
  const menuItems = useMenuItems();
  const allMenusEng = flattenPages(menuItems.items, 'en');
  const allMenusId = flattenPages(menuItems.items, 'id');
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
            top: 37,
            left: 0,
            width: 1,
            bgcolor: 'background.paper',
            zIndex: 1,
            borderRadius: '8px'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List dense={true} sx={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
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
                <Typography sx={{ mt: 2, ml: 2 }}>No result found for "{searchTerm}"</Typography>
              )}
            </List>
          )}
        </Box>
      )}
    </Box>
  );
};
}
export default Search;
