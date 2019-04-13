# warbler-server

## Running docker

Run docker as follows:

```
docker-compose up
```

then connect port 3000 on the IP address of the container, which you can retrieve as follows:

```
sudo docker inspect --format '{{ .NetworkSettings.IPAddress }}' <CONTAINER ID>
```

where CONTAINER ID is the ID of the container that is currently running the `web` service in the docker-compose.
