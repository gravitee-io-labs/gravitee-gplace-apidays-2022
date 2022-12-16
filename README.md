# gravitee-gplace-apidays-2022
r/Place (aka Pixel War) remake for Event Native API Management demo purposes.

- [Slide deck](https://github.com/gravitee-io-labs/gravitee-gplace-apidays-2022/raw/main/Apidays%20Paris%202022%20-%20Workshop.pdf)
- Video : soon

## Lab steps

1. Start the stack

    ```bash
    docker-compose -p gravitee-3-20-0-alpha-demo --project-directory . up -d
    ```

2. Import the postman [collection](https://github.com/gravitee-io-labs/gravitee-gplace-apidays-2022/blob/main/g-Place%20ApiDays%20Paris%202022.postman_collection.json) and [environment](https://github.com/gravitee-io-labs/gravitee-gplace-apidays-2022/blob/main/Local%20APIm.postman_environment.json)

3. Execute the postman requests one by one

4. Open [g/Place](http://localhost:8123).
   - Click and drag to move
   - Double click to place a pixel
   - Use the wheel to zoom in & out
