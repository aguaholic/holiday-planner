import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { AppContext } from '../AppProvider';
import Box from '@mui/material/Box';
import SearchField from './SearchField';
import CardActions from '@mui/material/CardActions';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Image from '../images/image_placeholder.png';

const SearchResults = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY
  });

  const { searchValue } = useContext(AppContext);
  const { siteData, setSiteData } = useContext(AppContext);

  const [map, setMap] = useState(null);
  const [sites, setSites] = useState([]);
  const [markerImage, setMarkerImage] = useState('');
  const [center, setCenter] = useState({
    lat: 52.3676,
    lng: 4.9041
  });
  const [isMarkerActive, setIsMarkerActive] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const user = localStorage.getItem('user');
  const localUser = JSON.parse(user);

  const getSiteImage = async (id) => {
    const response = await axios.get(`/api/sites/${id}`);
    setSiteData(response.data);
    setMarkerImage(response.data.image);
    setIsLoading(false);
  };

  const getSites = async (search) => {
    const response = await axios.get(`/api/search/${search}`);
    return response;
  };

  useEffect(() => {
    const getData = async () => {
      if (searchValue) {
        const results = await getSites(searchValue);
        setCenter((center) => ({
          ...center,
          lat: results.data.lat,
          lng: results.data.lon
        }));

        setSites(results.data.sites);
      }
    };

    getData();
  }, [searchValue]);

  useEffect(() => {
    if (isMarkerActive) {
      setIsLoading(true);
      getSiteImage(isMarkerActive);
      setIsLoading(false);
    }
  }, [isMarkerActive]);

  const handleOnLoad = (map) => {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
  };

  const handleMarkerClick = async (id) => {
    if (id === isMarkerActive) return;
    setIsMarkerActive(id);
  };

  const handleAddToList = async () => {
    try {
      const data = {
        siteData,
        searchValue: searchValue.toLowerCase(),
        email: localUser.email
      };
      return await axios.patch(`/api/lists/${searchValue}`, data);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <>
      <SearchField />
      <Box
        sx={{
          width: 'auto',
          height: '100%',
          backgroundColor: 'primary.dark'
        }}
      >
        {isLoaded && (
          <GoogleMap
            onLoad={handleOnLoad}
            center={center}
            zoom={15}
            mapContainerStyle={{ width: '100%', height: '150vh' }}
            options={{
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
              minZoom: 11,
              maxZoom: 15
            }}
          >
            {sites?.map((site) => {
              const obj = {
                lng: site.geometry.coordinates[0],
                lat: site.geometry.coordinates[1]
              };
              return (
                <Marker
                  key={site.properties.xid}
                  position={obj}
                  id={site.properties.xid}
                  onClick={() => handleMarkerClick(site.properties.xid)}
                >
                  {isMarkerActive === site.properties.xid ? (
                    <InfoWindow>
                      <>
                        <h2>{site.properties.name}</h2>
                        {markerImage ? (
                          <img src={markerImage} alt={site.properties.name} />
                        ) : (
                          <img src={Image} alt="no image available" />
                        )}
                        <CardActions
                          disableSpacing
                          sx={{ display: 'flex', width: '100%', position: 'relative' }}
                        >
                          <IconButton aria-label="add to favorites" sx={{ color: 'red' }}>
                            <FavoriteIcon />
                          </IconButton>
                          <IconButton
                            aria-label="share"
                            sx={{ color: 'green' }}
                            onClick={handleAddToList}
                          >
                            <AddIcon />
                          </IconButton>
                          <Button
                            size="small"
                            component="a"
                            href={`/search/${site.properties.xid}`}
                            sx={{ position: 'absolute', right: 10, bottom: 0 }}
                          >
                            Learn More
                          </Button>
                        </CardActions>
                      </>
                    </InfoWindow>
                  ) : null}
                </Marker>
              );
            })}
          </GoogleMap>
        )}
      </Box>
    </>
  );
};

export default SearchResults;
