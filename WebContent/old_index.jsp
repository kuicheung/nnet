<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<%@include file="view/util/include.jsp" %>
<title>Insert title here</title>
<style type="text/css">
	.content{
		margin-top:50px;
	}
</style>
<script>
	function init(){
		setTimeout(function(){
			$("#alert").slideUp(500);
		},1000);
	}
</script>
</head>
<body onload="init()">
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
      <div class="container">
        <div class="navbar-header">
	        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
	            <span class="sr-only">Toggle navigation</span>
	            <span class="icon-bar"></span>
	            <span class="icon-bar"></span>
	            <span class="icon-bar"></span>
	        </button>          	
        </div>
        <%@ include file="view/navBar/navBar.jsp" %>
      </div>
    </div>
    <div class="container content">
	<%if(request.getParameter("message")!=null){%>
		<div id="alert" class="alert alert-<%=request.getParameter("type")%>">
  			<a href="#" class="alert-link"><%=request.getParameter("message")%></a>
		</div>
	<%}%>
		<form action="compute" method="post">
			<button class="btn btn-primary">Load</button>
		</form>
		<div class="">
		<c:forEach var="net" items="${nets}">
			${net.testError}<br/>
			${net.verifyError }<br/>
		</c:forEach>
		<c:forEach var="joint" items="${joints}">
			<c:forEach var="pos" items="${joint.posX}">
				${pos }
			</c:forEach>
			<br/>
		</c:forEach>
		<c:forEach var="jointScores" items="${dtwScores}">
			${jointScores.key}:
			<c:forEach var="score" items="${jointScores.value}">
				${score},
			</c:forEach>
			<br/>
		</c:forEach>
		<c:forEach var="score" items="${netScores}">
			${score}<br/>
		</c:forEach>
		</div>
		<%@ include file="view/footer.jsp" %>
	</div>
</body>
</html>