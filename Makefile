ARCHIVE:="django_deploy.tar"
CURRENT_DIR:=$(CURDIR)

release: deploy

deploy:
	ansible-playbook -i ansible/production ansible/prod.yml
