FROM rabbitmq:3.8.3-management-alpine
RUN rabbitmq-plugins enable rabbitmq_web_stomp